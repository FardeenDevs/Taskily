"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const TASKS_KEY = "taskily-tasks";
const FIRST_TIME_KEY = "taskily-first-time";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load tasks from localStorage
    try {
      const storedTasks = localStorage.getItem(TASKS_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
        console.error("Failed to load tasks from localStorage", error);
    }
    setLoading(false);
    
    // Show welcome dialog for first time visitors
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

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  };

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

    saveTasks([...tasks, newTask]);

  }, [tasks, toast]);

  const toggleTask = useCallback((id: string) => {
    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(newTasks);
  }, [tasks]);

  const deleteTask = useCallback((id: string) => {
    const newTasks = tasks.filter((task) => task.id !== id);
    saveTasks(newTasks);
  }, [tasks]);

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

    const newTasks = tasks.map((task) =>
      task.id === id ? { ...task, text: newText.trim() } : task
    );
    saveTasks(newTasks);
  }, [tasks, toast]);
  
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [tasks]
  );


  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );
  const totalTasks = tasks.length;

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
  };
}
