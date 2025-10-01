"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const DATA_KEY = "listily-data-single";
const FIRST_TIME_KEY = "listily-first-time";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(DATA_KEY);
      const firstTime = localStorage.getItem(FIRST_TIME_KEY);

      if (storedData) {
        const parsedTasks = JSON.parse(storedData);
        setTasks(parsedTasks);
      } else if (firstTime === null) {
        setIsFirstTime(true);
        localStorage.setItem(FIRST_TIME_KEY, "false");
      }
      
    } catch (error) {
        console.error("Failed to load tasks from localStorage", error);
        setTasks([]);
    }
    setLoading(false);
  }, []);

  const saveData = useCallback((newTasks: Task[]) => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, []);
  
  const updateAndSave = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    saveData(newTasks);
  }, [saveData]);

  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [tasks]);
  
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );
  
  const totalTasks = tasks.length;
  
  const addTask = useCallback((text: string) => {
    if (text.trim() === "") return;

    const normalizedText = text.trim().toLowerCase();
    if (tasks.some(task => task.text.toLowerCase() === normalizedText)) {
      toast({
        variant: "destructive",
        title: "Duplicate Task",
        description: "A task with this name already exists.",
      });
      return;
    }
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    updateAndSave([...tasks, newTask]);

  }, [tasks, updateAndSave, toast]);

  const toggleTask = useCallback((id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateAndSave(updatedTasks);
  }, [tasks, updateAndSave]);

  const deleteTask = useCallback((id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    updateAndSave(updatedTasks);
  }, [tasks, updateAndSave]);

  const editTask = useCallback((id: string, newText: string) => {
    if (newText.trim() === "") return;

    const normalizedText = newText.trim().toLowerCase();
    const existingTask = tasks.find(task => task.text.toLowerCase() === normalizedText);
    if (existingTask && existingTask.id !== id) {
        toast({
            variant: "destructive",
            title: "Duplicate Task",
            description: "A task with this name already exists.",
        });
        return;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: newText.trim() } : task
    );
    updateAndSave(updatedTasks);
  }, [tasks, updateAndSave, toast]);
  
  const clearTasks = useCallback(() => {
    updateAndSave([]);
    toast({
        title: "Tasks Cleared",
        description: `All tasks have been deleted.`,
    });
  }, [updateAndSave, toast]);
  
  const resetApp = useCallback(() => {
    updateAndSave([]);
    toast({
        title: "App Reset",
        description: `All tasks have been deleted.`,
    });
  }, [updateAndSave, toast]);

  return {
    tasks: sortedTasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    completedTasks,
    totalTasks,
    isFirstTime,
    setIsFirstTime,
    clearTasks,
    resetApp,
  };
}
