
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task, type Workspace, type Priority, type Effort, type Note, type AppSettings } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDocs, getDoc, query, where, updateDoc, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged, updateProfile, deleteUser, type User as FirebaseUser } from "firebase/auth";
import { useSidebar } from "@/components/ui/sidebar";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { v4 as uuidv4 } from 'uuid'; // Using uuid for truly random codes


const ACTIVE_WORKSPACE_KEY = "listily-active-workspace";
const APP_SETTINGS_KEY = "listily-app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  defaultPriority: "P3",
  defaultEffort: "E3",
  defaultWorkspaceId: null,
};

// Helper function to generate backup codes
const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
        codes.push(uuidv4().slice(0, 8));
    }
    return codes;
};


export function useTasks() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [appSettings, setAppSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [notesBackupCodes, setNotesBackupCodes] = useState<string[] | null>(null);
  const [unlockedWorkspaces, setUnlockedWorkspaces] = useState<string[]>([]);
  
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Load settings from localStorage
  useEffect(() => {
    if (user) {
      const storedSettings = localStorage.getItem(`${APP_SETTINGS_KEY}-${user.uid}`);
      if (storedSettings) {
        setAppSettingsState(JSON.parse(storedSettings));
      }
    }
  }, [user]);

  // Save settings to localStorage
  const setAppSettings = useCallback((newSettings: Partial<AppSettings>) => {
    if (user) {
        setAppSettingsState(prev => {
            const updatedSettings = { ...prev, ...newSettings };
            localStorage.setItem(`${APP_SETTINGS_KEY}-${user.uid}`, JSON.stringify(updatedSettings));
            return updatedSettings;
        });
    }
  }, [user]);

  const isNotesLocked = useMemo(() => {
    if (!activeWorkspaceId || !activeWorkspace) return true;
    if (!activeWorkspace.notesPassword) return false;
    return !unlockedWorkspaces.includes(activeWorkspaceId);
  }, [activeWorkspace, activeWorkspaceId, unlockedWorkspaces]);

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

  const notesRef = useMemo(() => 
    (activeWorkspaceId && user && !isNotesLocked) ? collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'notes') : null
  , [activeWorkspaceId, user, firestore, isNotesLocked]);
  
  const { data: notes, loading: notesLoading } = useCollection<Note>(notesRef);

  // Handle user profile creation for new sign-ups
  useEffect(() => {
    if (!auth || !firestore) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // New user
          const isEmailUser = currentUser.providerData.some(p => p.providerId === 'password');
          
          const profileData = {
            displayName: currentUser.displayName || 'New User',
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          };
          
          const userPrivateDocRef = doc(firestore, 'users', currentUser.uid, 'private', 'data');
          
          const batch = writeBatch(firestore);
          batch.set(userDocRef, profileData);
          
          if (isEmailUser) {
            const codes = generateBackupCodes();
            // In a real app, hash these codes before storing
            batch.set(userPrivateDocRef, { backupCodes: codes });
            setBackupCodes(codes); // Show codes to the user
          }
          
          await batch.commit().catch(async (serverError) => {
             // It's hard to know which operation failed, so we provide a generic path
             const permissionError = new FirestorePermissionError({
                path: `/users/${currentUser.uid}`,
                operation: 'create',
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

  const clearBackupCodes = useCallback(() => {
    setBackupCodes(null);
  }, []);

  const clearNotesBackupCodes = useCallback(() => {
    setNotesBackupCodes(null);
  }, []);

  // Determine initial active workspace
  useEffect(() => {
    if (userLoading || workspacesLoading || !user || initialCheckDone) return;
  
    if (workspaces) {
      if (workspaces.length === 0) {
         setInitialCheckDone(true);
         return;
      }

      const defaultWorkspaceId = appSettings.defaultWorkspaceId;
      const storedWorkspaceId = localStorage.getItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`);

      const workspaceToSelect = 
        (defaultWorkspaceId && workspaces.some(ws => ws.id === defaultWorkspaceId)) ? defaultWorkspaceId :
        (storedWorkspaceId && workspaces.some(ws => ws.id === storedWorkspaceId)) ? storedWorkspaceId :
        null;
  
      if (workspaceToSelect) {
        setActiveWorkspaceId(workspaceToSelect);
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
  }, [user, userLoading, workspaces, workspacesLoading, initialCheckDone, appSettings.defaultWorkspaceId]);

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
    const isStillLoading = userLoading || workspacesLoading || (!!activeWorkspaceId && (activeWorkspaceLoading || tasksLoading || notesLoading)) || !initialCheckDone;
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
        ownerId: user.uid,
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

    if (id === appSettings.defaultWorkspaceId) {
        setAppSettings({ defaultWorkspaceId: null });
    }
    
    toast({
        title: "Listspace Deleted",
        description: "The Listspace and all its items have been removed.",
    });

  }, [firestore, user, workspaces, activeWorkspaceId, switchWorkspace, toast, appSettings.defaultWorkspaceId, setAppSettings]);

  const editWorkspace = useCallback((id: string, newName: string) => {
    if (newName.trim() === "" || !user || !workspaces) return;

    const workspace = workspaces.find(ws => ws.id === id);
    if (!workspace) return;
    
    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', id);
    const updatedData: Partial<Workspace> = { name: newName.trim() };
    
    setDoc(workspaceDocRef, updatedData, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: workspaceDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [user, firestore, workspaces]);

  const setNotesPassword = useCallback(async (workspaceId: string, password: string) => {
    if (!user) return;
    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', workspaceId);
    
    // In a real app, you would hash the password before storing it.
    // For this prototype, we'll store it directly, but this is NOT secure.
    const newBackupCodes = generateBackupCodes();
    const dataToUpdate = {
        notesPassword: password, // Again, HASH THIS in a real app
        notesBackupCodes: newBackupCodes
    };

    await updateDoc(workspaceDocRef, dataToUpdate)
        .then(() => {
            setNotesBackupCodes(newBackupCodes); // Show new backup codes to user
            setUnlockedWorkspaces(prev => [...prev, workspaceId]); // Automatically unlock
        })
        .catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: workspaceDocRef.path, operation: 'update', requestResourceData: dataToUpdate }));
        });
  }, [user, firestore]);

  const removeNotesPassword = useCallback(async (workspaceId: string) => {
    if (!user) return;
    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', workspaceId);
    const dataToUpdate = {
        notesPassword: null,
        notesBackupCodes: null
    };
    await updateDoc(workspaceDocRef, dataToUpdate).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: workspaceDocRef.path, operation: 'update', requestResourceData: dataToUpdate }));
    });
  }, [user, firestore]);

  const unlockNotes = useCallback(async (workspaceId: string, passwordOrCode: string): Promise<boolean> => {
    const workspace = workspaces?.find(ws => ws.id === workspaceId);
    if (!workspace || !workspace.notesPassword) return false;

    // Check if it's the main password
    if (workspace.notesPassword === passwordOrCode) {
        setUnlockedWorkspaces(prev => [...prev, workspaceId]);
        return true;
    }

    // Check if it's a backup code
    if (workspace.notesBackupCodes?.includes(passwordOrCode)) {
        if (!user) return false;
        const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', workspaceId);
        const dataToUpdate = {
            notesBackupCodes: arrayRemove(passwordOrCode)
        };
        await updateDoc(workspaceDocRef, dataToUpdate).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: workspaceDocRef.path, operation: 'update', requestResourceData: dataToUpdate }));
            throw e; // Prevent unlocking if DB update fails
        });
        setUnlockedWorkspaces(prev => [...prev, workspaceId]);
        toast({ title: "Backup Code Used", description: "This code has been removed from your list of available codes." });
        return true;
    }

    return false; // Invalid password or code
  }, [user, firestore, workspaces, toast]);

  const deleteAccount = useCallback(async () => {
    if (!user || !auth.currentUser || !firestore) {
        toast({ variant: "destructive", title: "Not signed in", description: "You must be signed in to delete an account." });
        return;
    }
    
    const currentUser = auth.currentUser;
    const userDocRef = doc(firestore, 'users', currentUser.uid);

    try {
        // This is a soft delete for the public profile to avoid breaking UI for other users who might interact with this user's content.
        // A more robust solution would use a cloud function to clean up all user data.
        const updateData = { displayName: "Deleted User" };
        await updateDoc(userDocRef, updateData)
            .catch(e => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'update', requestResourceData: updateData }));
                throw e; // re-throw to stop execution
            });

        // The actual user account deletion
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
  }, [user, auth, firestore, toast]);

  const updateUserProfile = useCallback(async (newDisplayName: string) => {
    if (!user || !auth.currentUser || !firestore) {
      toast({ variant: "destructive", title: "Not signed in" });
      return;
    }
    
    if (newDisplayName.trim().length < 2) {
      toast({ variant: "destructive", title: "Invalid Name", description: "Display name must be at least 2 characters." });
      return;
    }

    const currentUser = auth.currentUser;
    const userDocRef = doc(firestore, 'users', currentUser.uid);
    const updateData = { displayName: newDisplayName.trim() };

    try {
      // Update Firestore document first
      await updateDoc(userDocRef, updateData).catch(e => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'update', requestResourceData: updateData }));
          throw e;
      });

      // Then update Firebase Auth profile
      await updateProfile(currentUser, { displayName: newDisplayName.trim() });
      
      toast({ title: "Profile Updated", description: "Your display name has been changed." });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update your profile. Please try again." });
    }
  }, [user, auth, firestore, toast]);

  const completedTasks = useMemo(() => {
    return (tasks || []).filter(task => task.completed).length;
  }, [tasks]);

  return {
    tasks: tasks || [],
    notes: isNotesLocked ? [] : (notes || []),
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
    updateUserProfile,
    addWorkspace,
    deleteWorkspace,
    editWorkspace,
    switchWorkspace,
    appSettings,
    setAppSettings,
    backupCodes,
    clearBackupCodes,
    notesBackupCodes,
    clearNotesBackupCodes,
    isNotesLocked,
    unlockNotes,
    setNotesPassword,
    removeNotesPassword,
  };
}
