
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task, type Workspace, type Priority, type Effort, type Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const DATA_KEY = "listily-data-workspaces";
const FIRST_TIME_KEY = "listily-first-time-workspaces";

interface AppData {
  tasks: Task[];
  notes: Note[];
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}

const DEFAULT_WORKSPACE_ID = "default";

export function useTasks() {
  const [data, setData] = useState<AppData>({
    tasks: [],
    notes: [],
    workspaces: [],
    activeWorkspaceId: null,
  });
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedDataString = localStorage.getItem(DATA_KEY);
      const firstTime = localStorage.getItem(FIRST_TIME_KEY);
      
      if (storedDataString) {
        const storedData = JSON.parse(storedDataString);
        // Backwards compatibility for users from before notes were added
        if (!storedData.notes) {
            storedData.notes = [];
        }
        setData(storedData);
      } else {
        const defaultWorkspace: Workspace = { id: DEFAULT_WORKSPACE_ID, name: "My List", createdAt: new Date().toISOString() };
        setData({
          tasks: [],
          notes: [],
          workspaces: [defaultWorkspace],
          activeWorkspaceId: defaultWorkspace.id,
        });
        if (firstTime === null) {
          setIsFirstTime(true);
          localStorage.setItem(FIRST_TIME_KEY, "false");
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      const defaultWorkspace: Workspace = { id: DEFAULT_WORKSPACE_ID, name: "My List", createdAt: new Date().toISOString() };
      setData({
        tasks: [],
        notes: [],
        workspaces: [defaultWorkspace],
        activeWorkspaceId: defaultWorkspace.id,
      });
    }
    setLoading(false);
  }, []);

  const updateAndSave = useCallback((newData: Partial<AppData>) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [data]);

  const activeWorkspace = useMemo(() => {
    return data.workspaces.find(ws => ws.id === data.activeWorkspaceId);
  }, [data.workspaces, data.activeWorkspaceId]);

  const filteredTasks = useMemo(() => {
    return data.tasks
      .filter(task => task.workspaceId === data.activeWorkspaceId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data.tasks, data.activeWorkspaceId]);

  const filteredNotes = useMemo(() => {
    return (data.notes || [])
        .filter(note => note.workspaceId === data.activeWorkspaceId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data.notes, data.activeWorkspaceId]);

  const completedTasks = useMemo(() => {
    return filteredTasks.filter(task => task.completed).length;
  }, [filteredTasks]);

  const addTask = useCallback((text: string, priority: Priority | null, effort: Effort | null) => {
    if (text.trim() === "" || !data.activeWorkspaceId) return;

    const normalizedText = text.trim().toLowerCase();
    if (filteredTasks.some(task => task.text.toLowerCase() === normalizedText)) {
      toast({
        variant: "destructive",
        title: "Duplicate Task",
        description: "A task with this name already exists in this list.",
      });
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      workspaceId: data.activeWorkspaceId,
      priority,
      effort,
    };

    updateAndSave({ tasks: [...data.tasks, newTask] });
  }, [data, filteredTasks, updateAndSave, toast]);

  const toggleTask = useCallback((id: string) => {
    const updatedTasks = data.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateAndSave({ tasks: updatedTasks });
  }, [data, updateAndSave]);

  const deleteTask = useCallback((id: string) => {
    const updatedTasks = data.tasks.filter(task => task.id !== id);
    updateAndSave({ tasks: updatedTasks });
  }, [data, updateAndSave]);

  const editTask = useCallback((id: string, newText: string, newPriority: Priority | null, newEffort: Effort | null) => {
    if (newText.trim() === "") return;

    const normalizedText = newText.trim().toLowerCase();
    const existingTask = filteredTasks.find(task => task.text.toLowerCase() === normalizedText);
    if (existingTask && existingTask.id !== id) {
      toast({
        variant: "destructive",
        title: "Duplicate Task",
        description: "A task with this name already exists in this list.",
      });
      return;
    }

    const updatedTasks = data.tasks.map(task =>
      task.id === id ? { ...task, text: newText.trim(), priority: newPriority, effort: newEffort } : task
    );
    updateAndSave({ tasks: updatedTasks });
  }, [data, filteredTasks, updateAndSave, toast]);

  const clearTasks = useCallback((workspaceId: string) => {
    const workspace = data.workspaces.find(ws => ws.id === workspaceId);
    if (!workspace) return;
    const tasksToKeep = data.tasks.filter(task => task.workspaceId !== workspaceId);
    updateAndSave({ tasks: tasksToKeep });
    toast({
      title: "Tasks Cleared",
      description: `All tasks in "${workspace.name}" have been deleted.`,
    });
  }, [data, updateAndSave, toast]);

  // --- Note Management ---

  const addNote = useCallback((title: string, content: string): string | undefined => {
    if (!data.activeWorkspaceId) return;

    const newNote: Note = {
        id: crypto.randomUUID(),
        title: title || "New Note",
        content: content,
        createdAt: new Date().toISOString(),
        workspaceId: data.activeWorkspaceId,
    };
    updateAndSave({ notes: [...(data.notes || []), newNote] });
    return newNote.id;
  }, [data, updateAndSave]);

  const editNote = useCallback((id: string, newTitle: string, newContent: string) => {
    const updatedNotes = (data.notes || []).map(note =>
        note.id === id ? { ...note, title: newTitle.trim(), content: newContent } : note
    );
    updateAndSave({ notes: updatedNotes });
  }, [data, updateAndSave]);

  const deleteNote = useCallback((id: string) => {
    const updatedNotes = (data.notes || []).filter(note => note.id !== id);
    updateAndSave({ notes: updatedNotes });
  }, [data, updateAndSave]);

  const resetApp = useCallback(() => {
    const defaultWorkspace: Workspace = { id: DEFAULT_WORKSPACE_ID, name: "My List", createdAt: new Date().toISOString() };
    const newData = {
      tasks: [],
      notes: [],
      workspaces: [defaultWorkspace],
      activeWorkspaceId: defaultWorkspace.id,
    };
    updateAndSave(newData);
    toast({
      title: "App Reset",
      description: "Everything has been reset to default.",
    });
  }, [updateAndSave, toast]);

  // --- Workspace Management ---
  const addWorkspace = useCallback((name: string) => {
    if (name.trim() === "") return;
    
    const normalizedName = name.trim().toLowerCase();
    if (data.workspaces.some(ws => ws.name.toLowerCase() === normalizedName)) {
       toast({
        variant: "destructive",
        title: "Duplicate Listspace",
        description: "A Listspace with this name already exists.",
      });
      return;
    }

    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    updateAndSave({
      workspaces: [...data.workspaces, newWorkspace],
      activeWorkspaceId: newWorkspace.id,
    });
  }, [data, updateAndSave, toast]);

  const deleteWorkspace = useCallback((id: string) => {
    if (data.workspaces.length <= 1) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "You must have at least one Listspace.",
      });
      return;
    }
    const workspaces = data.workspaces.filter(ws => ws.id !== id);
    const tasks = data.tasks.filter(task => task.workspaceId !== id);
    const notes = (data.notes || []).filter(note => note.workspaceId !== id);
    const activeWorkspaceId = id === data.activeWorkspaceId ? workspaces[0].id : data.activeWorkspaceId;
    
    updateAndSave({ workspaces, tasks, notes, activeWorkspaceId });
    toast({
      title: "Listspace Deleted",
      description: "The Listspace and all its items have been removed.",
    });
  }, [data, updateAndSave, toast]);

  const editWorkspace = useCallback((id: string, newName: string) => {
    if (newName.trim() === "") return;

    const normalizedName = newName.trim().toLowerCase();
    if (data.workspaces.some(ws => ws.name.toLowerCase() === normalizedName && ws.id !== id)) {
       toast({
        variant: "destructive",
        title: "Duplicate Listspace",
        description: "A Listspace with this name already exists.",
      });
      return;
    }

    const workspaces = data.workspaces.map(ws =>
      ws.id === id ? { ...ws, name: newName.trim() } : ws
    );
    updateAndSave({ workspaces });
  }, [data, updateAndSave, toast]);

  const switchWorkspace = useCallback((id: string) => {
    if (id === data.activeWorkspaceId) return;
    updateAndSave({ activeWorkspaceId: id });
  }, [data, updateAndSave]);

  return {
    tasks: filteredTasks,
    notes: filteredNotes,
    workspaces: data.workspaces.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    activeWorkspace,
    activeWorkspaceId: data.activeWorkspaceId,
    loading,
    isFirstTime,
    setIsFirstTime,
    completedTasks,
    totalTasks: filteredTasks.length,

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
