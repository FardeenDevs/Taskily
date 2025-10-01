"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task, type Workspace } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const DATA_KEY = "taskily-data";
const FIRST_TIME_KEY = "taskily-first-time";

const createDefaultWorkspace = (): Workspace => ({
  id: crypto.randomUUID(),
  name: "General",
  tasks: [],
  createdAt: new Date().toISOString(),
});

export function useTasks() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(DATA_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.workspaces && data.activeWorkspaceId) {
          setWorkspaces(data.workspaces);
          setActiveWorkspaceId(data.activeWorkspaceId);
        } else {
            // Data is in old format, migrate it
            const tasks = storedData ? JSON.parse(storedData) : [];
            const defaultWorkspace = createDefaultWorkspace();
            defaultWorkspace.tasks = tasks;
            setWorkspaces([defaultWorkspace]);
            setActiveWorkspaceId(defaultWorkspace.id);
        }
      } else {
        const defaultWorkspace = createDefaultWorkspace();
        setWorkspaces([defaultWorkspace]);
        setActiveWorkspaceId(defaultWorkspace.id);
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        const defaultWorkspace = createDefaultWorkspace();
        setWorkspaces([defaultWorkspace]);
        setActiveWorkspaceId(defaultWorkspace.id);
    }
    setLoading(false);
    
    try {
        const firstTime = localStorage.getItem(FIRST_TIME_KEY);
        if (firstTime === null) {
            setIsFirstTime(true);
            localStorage.setItem(FIRST_TIME_KEY, "false");
        }
    } catch (error) {
        console.error("Failed to access localStorage for first-time check", error);
    }
  }, []);

  const saveData = (newWorkspaces: Workspace[], newActiveId: string | null) => {
    try {
      const dataToStore = {
        workspaces: newWorkspaces,
        activeWorkspaceId: newActiveId,
      };
      localStorage.setItem(DATA_KEY, JSON.stringify(dataToStore));
      setWorkspaces(newWorkspaces);
      setActiveWorkspaceId(newActiveId);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  };

  const activeWorkspace = useMemo(() => {
    return workspaces.find(ws => ws.id === activeWorkspaceId) || null;
  }, [workspaces, activeWorkspaceId]);

  const tasks = useMemo(() => {
    return activeWorkspace ? activeWorkspace.tasks : [];
  }, [activeWorkspace]);
  
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );
  
  const totalTasks = tasks.length;

  const updateTasksInWorkspace = (workspaceId: string, updatedTasks: Task[]) => {
    const newWorkspaces = workspaces.map(ws => 
      ws.id === workspaceId ? { ...ws, tasks: updatedTasks } : ws
    );
    saveData(newWorkspaces, activeWorkspaceId);
  }

  const addTask = useCallback((text: string) => {
    if (!activeWorkspaceId) return;
    if (text.trim() === "") return;

    const currentTasks = activeWorkspace?.tasks || [];
    const normalizedText = text.trim().toLowerCase();
    if (currentTasks.some(task => task.text.toLowerCase() === normalizedText)) {
      toast({
        variant: "destructive",
        title: "Duplicate Task",
        description: "A task with this name already exists in this Taskspace.",
      });
      return;
    }
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    const updatedTasks = [...currentTasks, newTask];
    updateTasksInWorkspace(activeWorkspaceId, updatedTasks);

  }, [activeWorkspace, activeWorkspaceId, workspaces, toast]);

  const toggleTask = useCallback((id: string) => {
    if (!activeWorkspaceId || !activeWorkspace) return;
    const updatedTasks = activeWorkspace.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTasksInWorkspace(activeWorkspaceId, updatedTasks);
  }, [activeWorkspace, activeWorkspaceId, workspaces]);

  const deleteTask = useCallback((id: string) => {
    if (!activeWorkspaceId || !activeWorkspace) return;
    const updatedTasks = activeWorkspace.tasks.filter((task) => task.id !== id);
    updateTasksInWorkspace(activeWorkspaceId, updatedTasks);
  }, [activeWorkspace, activeWorkspaceId, workspaces]);

  const editTask = useCallback((id: string, newText: string) => {
    if (!activeWorkspaceId || !activeWorkspace) return;
    if (newText.trim() === "") return;

    const currentTasks = activeWorkspace.tasks;
    const normalizedText = newText.trim().toLowerCase();
    const existingTask = currentTasks.find(task => task.text.toLowerCase() === normalizedText);
    if (existingTask && existingTask.id !== id) {
        toast({
            variant: "destructive",
            title: "Duplicate Task",
            description: "A task with this name already exists in this Taskspace.",
        });
        return;
    }

    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, text: newText.trim() } : task
    );
    updateTasksInWorkspace(activeWorkspaceId, updatedTasks);
  }, [activeWorkspace, activeWorkspaceId, workspaces, toast]);

  const addWorkspace = (name: string) => {
    if (name.trim() === "") return;
     if (workspaces.some(ws => ws.name.toLowerCase() === name.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Duplicate Taskspace",
            description: "A Taskspace with this name already exists.",
        });
        return;
    }

    const newWorkspace: Workspace = {
      id: crypto.randomUUID(),
      name: name.trim(),
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    const newWorkspaces = [...workspaces, newWorkspace];
    saveData(newWorkspaces, newWorkspace.id);
  };

  const switchWorkspace = (workspaceId: string) => {
    saveData(workspaces, workspaceId);
  }

  const deleteWorkspace = (workspaceId: string) => {
    if (workspaces.length <= 1) {
        toast({
            variant: "destructive",
            title: "Cannot Delete",
            description: "You must have at least one Taskspace.",
        });
        return;
    }
    const newWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
    let newActiveId = activeWorkspaceId;
    if(activeWorkspaceId === workspaceId) {
      newActiveId = newWorkspaces[0]?.id || null;
    }
    saveData(newWorkspaces, newActiveId);
  }
  
  const clearTasks = useCallback(() => {
    if (!activeWorkspaceId) return;
    updateTasksInWorkspace(activeWorkspaceId, []);
    toast({
        title: "Tasks Cleared",
        description: `All tasks in the "${activeWorkspace?.name}" Taskspace have been deleted.`,
    });
  }, [activeWorkspaceId, activeWorkspace?.name, workspaces, toast]);

  return {
    workspaces,
    activeWorkspace,
    tasks: sortedTasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    addWorkspace,
    switchWorkspace,
    deleteWorkspace,
    completedTasks,
    totalTasks,
    isFirstTime,
    setIsFirstTime,
    clearTasks,
  };
}
