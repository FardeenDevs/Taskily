
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task, type Workspace, type Priority, type Effort, type Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { useFirestore } from "@/firebase";
import { collection, addDoc, doc, setDoc, deleteDoc, writeBatch, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useCollection, useDoc } from "@/firebase";
import { useSidebar } from "@/components/ui/sidebar";

const ACTIVE_WORKSPACE_KEY = "listily-active-workspace";

export function useTasks() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { setOpen: setSidebarOpen } = useSidebar();
  
  // Firestore references
  const workspacesRef = useMemo(() => user ? collection(firestore, 'users', user.uid, 'workspaces') : null, [firestore, user]);
  const activeWorkspaceRef = useMemo(() => activeWorkspaceId && user ? doc(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId) : null, [firestore, user, activeWorkspaceId]);
  const tasksRef = useMemo(() => activeWorkspaceId && user ? collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'tasks') : null, [firestore, user, activeWorkspaceId]);
  const notesRef = useMemo(() => activeWorkspaceId && user ? collection(firestore, 'users', user.uid, 'workspaces', activeWorkspaceId, 'notes') : null, [firestore, user, activeWorkspaceId]);
  
  // Firestore data hooks
  const { data: workspaces, loading: workspacesLoading } = useCollection<Workspace>(workspacesRef);
  const { data: activeWorkspace, loading: activeWorkspaceLoading } = useDoc<Workspace>(activeWorkspaceRef);
  const { data: tasks, loading: tasksLoading } = useCollection<Task>(tasksRef);
  const { data: notes, loading: notesLoading } = useCollection<Note>(notesRef);

  // Determine initial active workspace
  useEffect(() => {
    if (user && !workspacesLoading) {
      const storedWorkspaceId = localStorage.getItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`);
      if (storedWorkspaceId && workspaces?.some(ws => ws.id === storedWorkspaceId)) {
        setActiveWorkspaceId(storedWorkspaceId);
      } else if (workspaces && workspaces.length > 0) {
        const sortedWorkspaces = [...workspaces].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setActiveWorkspaceId(sortedWorkspaces[0].id);
      } else if (workspaces?.length === 0) {
        // No workspaces exist, create a default one
        const defaultWorkspaceName = "My List";
        addDoc(collection(firestore, 'users', user.uid, 'workspaces'), {
            name: defaultWorkspaceName,
            createdAt: serverTimestamp(),
            ownerId: user.uid
        }).then(docRef => {
            setActiveWorkspaceId(docRef.id);
            setIsFirstTime(true);
        });
      }
    }
  }, [user, workspaces, workspacesLoading, firestore]);

  // Update loading state
  useEffect(() => {
    const isStillLoading = userLoading || workspacesLoading || (!!activeWorkspaceId && (activeWorkspaceLoading || tasksLoading || notesLoading));
    setLoading(isStillLoading);
  }, [userLoading, workspacesLoading, activeWorkspaceId, activeWorkspaceLoading, tasksLoading, notesLoading]);

  const switchWorkspace = useCallback((id: string) => {
    if (user) {
        setActiveWorkspaceId(id);
        localStorage.setItem(`${ACTIVE_WORKSPACE_KEY}-${user.uid}`, id);
        setSidebarOpen(false);
    }
  }, [user, setSidebarOpen]);

  const addTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    if (text.trim() === "" || !tasksRef) return;

    addDoc(tasksRef, {
      text: text.trim(),
      completed: false,
      createdAt: serverTimestamp(),
      priority,
      effort,
    });
  }, [tasksRef]);

  const toggleTask = useCallback((id: string) => {
    if (!tasksRef) return;
    const taskDocRef = doc(tasksRef, id);
    const task = tasks?.find(t => t.id === id);
    if (task) {
        setDoc(taskDocRef, { completed: !task.completed }, { merge: true });
    }
  }, [tasks, tasksRef]);

  const deleteTask = useCallback((id: string) => {
    if (!tasksRef) return;
    deleteDoc(doc(tasksRef, id));
  }, [tasksRef]);

  const editTask = useCallback((id: string, newText: string, newPriority: Priority | null, newEffort: Effort | null) => {
    if (newText.trim() === "" || !tasksRef) return;
    setDoc(doc(tasksRef, id), { text: newText.trim(), priority: newPriority, effort: newEffort }, { merge: true });
  }, [tasksRef]);

  const clearTasks = useCallback(async (workspaceId: string) => {
    if (!user) return;
    const batch = writeBatch(firestore);
    const tasksCollectionRef = collection(firestore, 'users', user.uid, 'workspaces', workspaceId, 'tasks');
    const querySnapshot = await getDocs(tasksCollectionRef);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    toast({
      title: "Tasks Cleared",
      description: `All tasks in this listspace have been deleted.`,
    });
  }, [firestore, user, toast]);

  const addNote = useCallback((title: string, content: string) => {
    if (!notesRef) return;
    addDoc(notesRef, {
        title: title || "New Note",
        content: content,
        createdAt: serverTimestamp(),
    }).then((docRef) => {
      // Logic to open dialog for new note is now handled in the component
    });
  }, [notesRef]);

  const editNote = useCallback((id: string, newTitle: string, newContent: string) => {
    if (!notesRef) return;
    setDoc(doc(notesRef, id), { title: newTitle.trim(), content: newContent }, { merge: true });
  }, [notesRef]);

  const deleteNote = useCallback((id: string) => {
    if (!notesRef) return;
    deleteDoc(doc(notesRef, id));
  }, [notesRef]);

  const resetApp = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(firestore);
    const workspacesCollectionRef = collection(firestore, 'users', user.uid, 'workspaces');
    const querySnapshot = await getDocs(workspacesCollectionRef);
    querySnapshot.forEach(async (workspaceDoc) => {
        const tasksCollectionRef = collection(workspaceDoc.ref, 'tasks');
        const tasksSnapshot = await getDocs(tasksCollectionRef);
        tasksSnapshot.forEach(taskDoc => batch.delete(taskDoc.ref));
        
        const notesCollectionRef = collection(workspaceDoc.ref, 'notes');
        const notesSnapshot = await getDocs(notesCollectionRef);
        notesSnapshot.forEach(noteDoc => batch.delete(noteDoc.ref));
        
        batch.delete(workspaceDoc.ref);
    });
    
    await batch.commit();
    
    // Create a new default workspace after clearing everything
     const defaultWorkspaceName = "My List";
     const newWorkspaceRef = await addDoc(collection(firestore, 'users', user.uid, 'workspaces'), {
         name: defaultWorkspaceName,
         createdAt: serverTimestamp(),
         ownerId: user.uid
     });

    setActiveWorkspaceId(newWorkspaceRef.id);
    toast({
      title: "App Reset",
      description: "Everything has been reset to default.",
    });
  }, [firestore, user, toast]);

  const addWorkspace = useCallback((name: string) => {
    if (name.trim() === "" || !workspacesRef) return;
    
    addDoc(workspacesRef, {
        name: name.trim(),
        createdAt: serverTimestamp(),
        ownerId: user?.uid
    }).then(docRef => {
        switchWorkspace(docRef.id);
    });
  }, [workspacesRef, user, switchWorkspace]);

  const deleteWorkspace = useCallback(async (id: string) => {
     if (!user) return;
     if (workspaces && workspaces.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "You must have at least one Listspace.",
      });
      return;
    }

    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', id);
    // Recursively delete subcollections
    const tasksCollectionRef = collection(workspaceDocRef, 'tasks');
    const tasksSnapshot = await getDocs(tasksCollectionRef);
    const notesCollectionRef = collection(workspaceDocRef, 'notes');
    const notesSnapshot = await getDocs(notesCollectionRef);

    const batch = writeBatch(firestore);
    tasksSnapshot.forEach(doc => batch.delete(doc.ref));
    notesSnapshot.forEach(doc => batch.delete(doc.ref));
    batch.delete(workspaceDocRef);

    await batch.commit();
    
    if (id === activeWorkspaceId) {
       const remainingWorkspaces = workspaces?.filter(ws => ws.id !== id) || [];
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

  const editWorkspace = useCallback((id: string, newName: string) => {
    if (newName.trim() === "" || !user) return;

    const workspaceDocRef = doc(firestore, 'users', user.uid, 'workspaces', id);
    setDoc(workspaceDocRef, { name: newName.trim() }, { merge: true });
  }, [firestore, user]);

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
