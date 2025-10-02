
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task, type Workspace, type Priority, type Effort, type Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDocs, getDoc, query, where, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile, deleteUser } from "firebase/auth";
import { useSidebar } from "@/components/ui/sidebar";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const ACTIVE_WORKSPACE_KEY = "listily-active-workspace";

function generateBackupCodes(): string[] {
    const codes = new Set<string>();
    while (codes.size < 10) {
      // Create a 6-character alphanumeric code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.add(code);
    }
    return Array.from(codes);
}

export function useTasks() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [unlockedWorkspaces, setUnlockedWorkspaces] = useState<Set<string>>(new Set());
  
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Firestore references
  const workspacesQuery = useMemo(() => 
    user ? query(collection(firestore, 'users', user.uid, 'workspaces')) : null
  , [firestore, user]);
  
  const { data: workspaces, loading: workspacesLoading } = useCollection<Workspace>(workspacesQuery);

  const activeWorkspaceRef = useMemo(() => 
    activeWorkspaceId && user ? doc(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId) : null
  , [activeWorkspaceId, user, firestore]);
  
  const { data: activeWorkspace, loading: activeWorkspaceLoading } = useDoc<Workspace>(activeWorkspaceRef);
  
  const tasksRef = useMemo(() => 
    activeWorkspaceId && user ? collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'tasks') : null
  , [activeWorkspaceId, user, firestore]);
  
  const { data: tasks, loading: tasksLoading } = useCollection<Task>(tasksRef);

  const notesRef = useMemo(() => {
    if (!activeWorkspaceId || !user || !firestore) return null;
    
    // Defer dependency on activeWorkspace to inside this memo
    const currentWorkspace = workspaces?.find(ws => ws.id === activeWorkspaceId);
    const isLocked = currentWorkspace?.password && !unlockedWorkspaces.has(activeWorkspaceId);

    if(isLocked) return null;

    return collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'notes');
  }, [activeWorkspaceId, user, firestore, unlockedWorkspaces, workspaces]);
  
  const { data: notes, loading: notesLoading } = useCollection<Note>(notesRef);

  // Handle user profile creation for new sign-ups
  useEffect(() => {
    if (!auth || !firestore) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          const displayName = currentUser.displayName || 'New User';
          const profileData = {
            displayName: displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          };
          
          setDoc(userDocRef, profileData).catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'create',
                    requestResourceData: profileData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });

          if (!currentUser.displayName) {
             await updateProfile(currentUser, { displayName: 'New User' });
          }
        }
      }
    });
    return () => unsubscribe();
  }, [auth, firestore]);

  // Determine initial active workspace
  useEffect(() => {
    if (userLoading || workspacesLoading || !user || initialCheckDone) return;
  
    if (workspaces) {
      if (workspaces.length === 0) {
         setInitialCheckDone(true);
         return;
      }
  
      const storedWorkspaceId = localStorage.getItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`);
      if (storedWorkspaceId && workspaces.some(ws => ws.id === storedWorkspaceId)) {
        setActiveWorkspaceId(storedWorkspaceId);
      } else if (workspaces.length > 0) {
        const sortedWorkspaces = [...workspaces].sort((a, b) => {
          const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
          const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
          return dateA.getTime() - dateB.getTime();
        });
        setActiveWorkspaceId(sortedWorkspaces[0].id);
      }
      setInitialCheckDone(true);
    }
  }, [user, userLoading, workspaces, workspacesLoading, initialCheckDone]);

  // Create default workspace if none exist after initial check
  useEffect(() => {
    if (initialCheckDone && user && firestore && workspaces?.length === 0) {
        setLoading(true);
        const defaultWorkspaceName = "My List";
        const workspaceData = {
            name: defaultWorkspaceName,
            createdAt: serverTimestamp(),
            ownerId: user.uid
        };

        const workspacesCollectionRef = collection(firestore, 'users', user.uid, 'workspaces');

        addDoc(workspacesCollectionRef, workspaceData)
        .then(docRef => {
            setActiveWorkspaceId(docRef.id);
            setIsFirstTime(true);
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: workspacesCollectionRef.path,
                operation: 'create',
                requestResourceData: workspaceData,
            });
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setLoading(false);
        });
    }
  }, [initialCheckDone, workspaces, user, firestore]);


  // Update loading state
  useEffect(() => {
    const isStillLoading = userLoading || workspacesLoading || (!!activeWorkspaceId && (activeWorkspaceLoading || tasksLoading || notesLoading === undefined)) || !initialCheckDone;
    setLoading(isStillLoading);
  }, [userLoading, workspacesLoading, activeWorkspaceId, activeWorkspaceLoading, tasksLoading, notesLoading, initialCheckDone]);


  const switchWorkspace = useCallback((id: string | null) => {
    if (user) {
        setActiveWorkspaceId(id);
        if (id) {
          localStorage.setItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`, id);
        } else {
          localStorage.removeItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`);
        }
        if (setSidebarOpen) {
          setSidebarOpen(false);
        }
    }
  }, [user, setSidebarOpen]);

  const addTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    if (text.trim() === "" || !activeWorkspaceId || !user || !tasksRef) return;
    
    const taskData = {
      text: text.trim(),
      completed: false,
      createdAt: serverTimestamp(),
      priority,
      effort,
    };

    addDoc(tasksRef, taskData)
     .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: tasksRef.path,
            operation: 'create',
            requestResourceData: taskData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [activeWorkspaceId, user, tasksRef]);

  const toggleTask = useCallback((id: string) => {
    if (!tasksRef || !tasks) return;
    const taskDocRef = doc(tasksRef, id);
    const task = tasks.find(t => t.id === id);
    if (task) {
        const updatedData = { completed: !task.completed };
        setDoc(taskDocRef, updatedData, { merge: true })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: taskDocRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
  }, [tasks, tasksRef]);

  const deleteTask = useCallback((id: string) => {
    if (!tasksRef) return;
    const taskDocRef = doc(tasksRef, id);
    deleteDoc(taskDocRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [tasksRef]);

  const editTask = useCallback((id: string, newText: string, newPriority: Priority | null, newEffort: Effort | null) => {
    if (newText.trim() === "" || !tasksRef) return;
    const taskDocRef = doc(tasksRef, id);
    const updatedData = { text: newText.trim(), priority: newPriority, effort: newEffort };
    setDoc(taskDocRef, updatedData, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [tasksRef]);

  const clearTasks = useCallback(async (workspaceId: string) => {
    if (!user) return;
    const batch = writeBatch(firestore);
    const tasksCollectionRef = collection(firestore, 'users', user.uid, 'workspaces', workspaceId, 'tasks');
    try {
        const querySnapshot = await getDocs(tasksCollectionRef);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        toast({
          title: "Tasks Cleared",
          description: `All tasks in this listspace have been deleted.`,
        });
    } catch(e) {
        const permissionError = new FirestorePermissionError({
            path: tasksCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }, [firestore, user, toast]);

  const addNote = useCallback((): Note | undefined => {
    if (!notesRef || !activeWorkspaceId) return;
    const newNoteId = doc(collection(firestore, 'dummy')).id; // client-side id
    const newNote: Note = {
      id: newNoteId,
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      workspaceId: activeWorkspaceId,
      isNew: true, // flag to indicate it's a temporary client-side note
    };
    return newNote;
  }, [notesRef, firestore, activeWorkspaceId]);

  const editNote = useCallback((id: string, newTitle: string, newContent: string, isNew?: boolean) => {
    if (!notesRef) return;
    const noteDocRef = doc(notesRef, id);
    
    if (isNew) {
      const dataToSave = { 
        title: newTitle.trim() || 'Untitled Note', 
        content: newContent,
        createdAt: serverTimestamp(),
      };
      setDoc(noteDocRef, dataToSave).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: noteDocRef.path,
            operation: 'create',
            requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    } else {
      const dataToUpdate = { 
        title: newTitle.trim() || 'Untitled Note', 
        content: newContent,
      };
      updateDoc(noteDocRef, dataToUpdate).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: noteDocRef.path,
            operation: 'update',
            requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  }, [notesRef]);

  const deleteNote = useCallback((id: string, isLocal?: boolean) => {
    if (isLocal) return; // Just a local deletion, no DB call needed
    if (!notesRef) return;
    const noteDocRef = doc(notesRef, id);
    deleteDoc(noteDocRef)
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: noteDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [notesRef]);

  const resetApp = useCallback(async () => {
    if (!user || !firestore) return;
    
    const userWorkspacesQuery = query(collection(firestore, 'users', user.uid, 'workspaces'));
    
    getDocs(userWorkspacesQuery).then(async (querySnapshot) => {
        const batch = writeBatch(firestore);

        for (const workspaceDoc of querySnapshot.docs) {
            const tasksCollectionRef = collection(workspaceDoc.ref, 'tasks');
            const tasksSnapshot = await getDocs(tasksCollectionRef).catch(e => {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({ path: tasksCollectionRef.path, operation: 'list' }));
                 throw e;
            });
            tasksSnapshot.forEach(taskDoc => batch.delete(taskDoc.ref));
            
            const notesCollectionRef = collection(workspaceDoc.ref, 'notes');
            const notesSnapshot = await getDocs(notesCollectionRef).catch(e => {
                 errorEmitter.emit('permission-error', new FirestorePermissionError({ path: notesCollectionRef.path, operation: 'list' }));
                 throw e;
            });
            notesSnapshot.forEach(noteDoc => batch.delete(noteDoc.ref));
            
            batch.delete(workspaceDoc.ref);
        }
        
        await batch.commit().catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `/users/${user.uid}/workspaces`, operation: 'write' }));
            throw e;
        });

        const workspacesCollectionRef = collection(firestore, 'users', user.uid, 'workspaces');
        
        // Create a new default workspace after clearing everything
         const defaultWorkspaceName = "My List";
         const workspaceData = {
             name: defaultWorkspaceName,
             createdAt: serverTimestamp(),
             ownerId: user.uid
         };
         const newWorkspaceRef = await addDoc(workspacesCollectionRef, workspaceData).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: workspacesCollectionRef.path, operation: 'create', requestResourceData: workspaceData }));
            throw e;
         });

        setActiveWorkspaceId(newWorkspaceRef.id);
        toast({
          title: "App Reset",
          description: "Everything has been reset to default.",
        });
    }).catch(e => {
         errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userWorkspacesQuery.path, operation: 'list' }));
    });
  }, [user, toast, firestore]);

  const addWorkspace = useCallback((name: string) => {
    if (name.trim() === "" || !user) return;
    
    const workspacesCollectionRef = collection(firestore, 'users', user.uid, 'workspaces');

    const workspaceData = {
        name: name.trim(),
        createdAt: serverTimestamp(),
        ownerId: user.uid
    };

    addDoc(workspacesCollectionRef, workspaceData)
    .then(docRef => {
        switchWorkspace(docRef.id);
    })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: workspacesCollectionRef.path,
            operation: 'create',
            requestResourceData: workspaceData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, firestore, switchWorkspace]);

  const deleteWorkspace = useCallback(async (id: string) => {
     if (!user || !workspaces || !firestore) return;
     if (workspaces.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "You must have at least one Listspace.",
      });
      return;
    }

    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', id);

    const tasksCollectionRef = collection(workspaceDocRef, 'tasks');
    const tasksSnapshot = await getDocs(tasksCollectionRef).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: tasksCollectionRef.path, operation: 'list' }));
        throw e;
    });

    const notesCollectionRef = collection(workspaceDocRef, 'notes');
    const notesSnapshot = await getDocs(notesCollectionRef).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: notesCollectionRef.path, operation: 'list' }));
        throw e;
    });

    const batch = writeBatch(firestore);
    tasksSnapshot.forEach(doc => batch.delete(doc.ref));
    notesSnapshot.forEach(doc => batch.delete(doc.ref));
    batch.delete(workspaceDocRef);

    await batch.commit().catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: workspaceDocRef.path, operation: 'delete' }));
        throw e;
    });
    
    if (id === activeWorkspaceId) {
        const remainingWorkspaces = workspaces.filter(ws => ws.id !== id) || [];
        if (remainingWorkspaces.length > 0) {
            switchWorkspace(remainingWorkspaces[0].id);
        } else {
            setActiveWorkspaceId(null);
        }
    }
    
    toast({
        title: "Listspace Deleted",
        description: "The Listspace and all its items have been removed.",
    });

  }, [firestore, user, workspaces, activeWorkspaceId, switchWorkspace, toast]);

  const editWorkspace = useCallback((id: string, newName: string, currentPassword?: string, newPassword?: string, newPasswordHint?: string): { success: boolean, newBackupCodes?: string[] } => {
    if (newName.trim() === "" || !user || !workspaces) return { success: false };

    const workspace = workspaces.find(ws => ws.id === id);
    if (!workspace) return { success: false };

    // If the workspace has a password, the current password must be correct to make any changes
    if (workspace.password && currentPassword !== workspace.password) {
      return { success: false };
    }
    
    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', id);
    const updatedData: Partial<Workspace> = { name: newName.trim() };
    
    let newBackupCodes: string[] | undefined = undefined;

    // Check if we are setting a password for the first time or changing it
    const isSettingNewPassword = newPassword && newPassword !== workspace.password;

    if (newPassword !== undefined) {
      updatedData.password = newPassword;
      updatedData.passwordHint = newPasswordHint || "";
       if (!newPassword) { // If new password is empty string, it means we are removing it.
        updatedData.backupCodes = []; // Clear backup codes
        setUnlockedWorkspaces(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });
      } else if (isSettingNewPassword) {
        newBackupCodes = generateBackupCodes();
        updatedData.backupCodes = newBackupCodes;
      }
    }

    setDoc(workspaceDocRef, updatedData, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: workspaceDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return { success: true, newBackupCodes };

  }, [user, firestore, workspaces]);

  const deleteAccount = useCallback(async () => {
    if (!user || !auth.currentUser || !firestore) {
        toast({ variant: "destructive", title: "Not signed in", description: "You must be signed in to delete an account." });
        return;
    }
    
    const currentUser = auth.currentUser;
    const userDocRef = doc(firestore, 'users', currentUser.uid);

    try {
        const updateData = { displayName: "Deleted User" };
        await updateDoc(userDocRef, updateData)
            .catch(e => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'update', requestResourceData: updateData }));
                throw e; // re-throw to stop execution
            });

        await deleteUser(currentUser).catch(error => {
            console.error("Error deleting account: ", error);
            if (error.code === 'auth/requires-recent-login') {
                toast({
                    variant: "destructive",
                    title: "Action Required",
                    description: "This is a sensitive action. Please sign out and sign back in before deleting your account.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error Deleting Account",
                    description: "An error occurred while trying to delete your account. Please try again.",
                });
            }
            throw error;
        });

        toast({ title: "Account Deleted", description: "Your account has been successfully deleted." });

    } catch (error) {
        console.error("Failed to complete account deletion process:", error);
    }
  }, [user, firestore, auth, toast]);

  const completedTasks = useMemo(() => {
    return (tasks || []).filter(task => task.completed).length;
  }, [tasks]);

  const unlockWithPassword = useCallback(async (workspaceId: string, password) => {
    if (!user || !firestore) return false;
    const workspace = workspaces?.find(ws => ws.id === workspaceId);
    if (!workspace || !workspace.password) return false;

    if (workspace.password === password) {
      setUnlockedWorkspaces(prev => new Set(prev).add(workspaceId));
      return true;
    }

    return false;
  }, [workspaces, user, firestore]);

  const unlockWithBackupCode = useCallback(async (workspaceId: string, code: string) => {
    if (!user || !firestore) return false;
    const workspace = workspaces?.find(ws => ws.id === workspaceId);
    if (!workspace) return false;
    
    const backupCodes = workspace.backupCodes || [];
    if (backupCodes.includes(code.toUpperCase())) {
      const updatedCodes = backupCodes.filter(c => c !== code.toUpperCase());
      const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', workspaceId);
      
      try {
        const updateData = { backupCodes: updatedCodes };
        await updateDoc(workspaceDocRef, updateData)
         .catch(e => {
            const permissionError = new FirestorePermissionError({
                path: workspaceDocRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw e;
        });

        setUnlockedWorkspaces(prev => new Set(prev).add(workspaceId));
        toast({
            title: "Backup Code Used",
            description: "This code has been invalidated. You have " + updatedCodes.length + " codes remaining.",
        });
        return true;
      } catch (e) {
          return false;
      }
    }
    return false;
  }, [workspaces, user, firestore, toast]);

  const lockWorkspace = useCallback((workspaceId: string) => {
    setUnlockedWorkspaces(prev => {
      const newSet = new Set(prev);
      newSet.delete(workspaceId);
      return newSet;
    });
  }, []);

  return {
    tasks: tasks || [],
    notes: notes || [],
    workspaces: (workspaces || []).sort((a,b) => {
        const dateA = a.createdAt ? (typeof (a.createdAt as any).toDate === 'function' ? (a.createdAt as any).toDate() : new Date(a.createdAt as string)) : new Date(0);
        const dateB = b.createdAt ? (typeof (b.createdAt as any).toDate === 'function' ? (b.createdAt as any).toDate() : new Date(b.createdAt as string)) : new Date(0);
        return dateA.getTime() - dateB.getTime();
    }),
    activeWorkspace,
    activeWorkspaceId,
    loading,
    isFirstTime,
    setIsFirstTime,
    completedTasks,
    totalTasks: (tasks || []).length,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    clearTasks,
    addNote,
    editNote,
    deleteNote,
    resetApp,
    deleteAccount,
    addWorkspace,
    deleteWorkspace,
    editWorkspace,
    switchWorkspace,
    unlockedWorkspaces,
    unlockWithPassword,
    unlockWithBackupCode,
    lockWorkspace,
  };
}

    

    