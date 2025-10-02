
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task, type Workspace, type Priority, type Effort, type Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, addDoc, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, getDocs, getDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { useSidebar } from "@/components/ui/sidebar";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const ACTIVE_WORKSPACE_KEY = "listily-active-workspace";

export function useTasks() {
  const auth = useAuth();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Firestore references
  const workspacesQuery = useMemo(() => 
    user ? query(collection(firestore, 'users', user.uid, 'workspaces'), where('ownerId', '==', user.uid)) : null
  , [firestore, user]);

  const activeWorkspaceRef = useMemo(() => 
    activeWorkspaceId && user ? doc(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId) : null
  , [activeWorkspaceId, user, firestore]);
  
  const tasksRef = useMemo(() => 
    activeWorkspaceId && user ? collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'tasks') : null
  , [activeWorkspaceId, user, firestore]);

  const notesRef = useMemo(() => 
    activeWorkspaceId && user ? collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'notes') : null
  , [activeWorkspaceId, user, firestore]);
  
  // Firestore data hooks
  const { data: workspaces, loading: workspacesLoading } = useCollection<Workspace>(workspacesQuery);
  const { data: activeWorkspace, loading: activeWorkspaceLoading } = useDoc<Workspace>(activeWorkspaceRef);
  const { data: tasks, loading: tasksLoading } = useCollection<Task>(tasksRef);
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
    if (userLoading || workspacesLoading) return;

    if (user && !initialCheckDone) {
      if (workspaces) {
        if (workspaces.length === 0) {
           setInitialCheckDone(true);
           return;
        }

        const storedWorkspaceId = localStorage.getItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`);
        if (storedWorkspaceId && workspaces.some(ws => ws.id === storedWorkspaceId)) {
          setActiveWorkspaceId(storedWorkspaceId);
        } else if (workspaces.length > 0) {
          const sortedWorkspaces = [...workspaces].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setActiveWorkspaceId(sortedWorkspaces[0].id);
        }
        setInitialCheckDone(true);
      }
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
    const isStillLoading = userLoading || workspacesLoading || (!!activeWorkspaceId && (activeWorkspaceLoading || tasksLoading || notesLoading)) || !initialCheckDone;
    setLoading(isStillLoading);
  }, [userLoading, workspacesLoading, activeWorkspaceId, activeWorkspaceLoading, tasksLoading, notesLoading, initialCheckDone]);

  const switchWorkspace = useCallback((id: string) => {
    if (user) {
        setActiveWorkspaceId(id);
        localStorage.setItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`, id);
        if (setSidebarOpen) {
          setSidebarOpen(false);
        }
    }
  }, [user, setSidebarOpen]);

  const addTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    if (text.trim() === "" || !tasksRef) return;

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
  }, [tasksRef]);

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

  const addNote = useCallback(() : Note | undefined => {
    if (!notesRef || !activeWorkspaceId) return;
    const newNoteId = doc(collection(firestore, 'dummy')).id; // client-side id
    const newNote: Note = {
      id: newNoteId,
      title: 'New Note',
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
    const dataToSave = { 
        title: newTitle.trim(), 
        content: newContent,
        createdAt: serverTimestamp(),
    };
    const dataToUpdate = { 
        title: newTitle.trim(), 
        content: newContent,
    };
    
    // If it's a new note, we use setDoc to create it. Otherwise, we update.
    const operation = isNew ? setDoc(noteDocRef, dataToSave) : setDoc(noteDocRef, dataToUpdate, { merge: true });

    operation.catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: noteDocRef.path,
            operation: isNew ? 'create' : 'update',
            requestResourceData: isNew ? dataToSave : dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [notesRef]);

  const deleteNote = useCallback((id: string) => {
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
    
    const userWorkspacesQuery = query(collection(firestore, 'users', user.uid, 'workspaces'), where('ownerId', '==', user.uid));
    
    try {
        const batch = writeBatch(firestore);
        const querySnapshot = await getDocs(userWorkspacesQuery);
        
        for (const workspaceDoc of querySnapshot.docs) {
            const tasksCollectionRef = collection(workspaceDoc.ref, 'tasks');
            const tasksSnapshot = await getDocs(tasksCollectionRef);
            tasksSnapshot.forEach(taskDoc => batch.delete(taskDoc.ref));
            
            const notesCollectionRef = collection(workspaceDoc.ref, 'notes');
            const notesSnapshot = await getDocs(notesCollectionRef);
notesSnapshot.forEach(noteDoc => batch.delete(noteDoc.ref));
            
            batch.delete(workspaceDoc.ref);
        }
        
        await batch.commit();

        const workspacesCollectionRef = collection(firestore, 'users', user.uid, 'workspaces');
        
        // Create a new default workspace after clearing everything
         const defaultWorkspaceName = "My List";
         const workspaceData = {
             name: defaultWorkspaceName,
             createdAt: serverTimestamp(),
             ownerId: user.uid
         };
         const newWorkspaceRef = await addDoc(workspacesCollectionRef, workspaceData);

        setActiveWorkspaceId(newWorkspaceRef.id);
        toast({
          title: "App Reset",
          description: "Everything has been reset to default.",
        });
    } catch (e) {
         const permissionError = new FirestorePermissionError({
            path: userWorkspacesQuery.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
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
    try {
        const tasksCollectionRef = collection(workspaceDocRef, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        const notesCollectionRef = collection(workspaceDocRef, 'notes');
        const notesSnapshot = await getDocs(notesCollectionRef);

        const batch = writeBatch(firestore);
        tasksSnapshot.forEach(doc => batch.delete(doc.ref));
        notesSnapshot.forEach(doc => batch.delete(noteDoc.ref));
        batch.delete(workspaceDocRef);

        await batch.commit();
        
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
    } catch(e) {
        const permissionError = new FirestorePermissionError({
            path: workspaceDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }, [firestore, user, workspaces, activeWorkspaceId, switchWorkspace, toast]);

  const editWorkspace = useCallback((id: string, newName: string) => {
    if (newName.trim() === "" || !user) return;
    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', id);
    const updatedData = { name: newName.trim() };
    setDoc(workspaceDocRef, updatedData, { merge: true })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: workspaceDocRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [user, firestore]);

  const completedTasks = useMemo(() => {
    return (tasks || []).filter(task => task.completed).length;
  }, [tasks]);

  return {
    tasks: tasks || [],
    notes: notes || [],
    workspaces: (workspaces || []).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
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
    addWorkspace,
    deleteWorkspace,
    editWorkspace,
    switchWorkspace,
  };
}

    
