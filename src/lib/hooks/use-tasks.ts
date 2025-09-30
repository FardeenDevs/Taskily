"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "taskily-tasks";
const FIRST_TIME_KEY = "taskily-first-time";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }

      const firstTime = localStorage.getItem(FIRST_TIME_KEY);
      if (firstTime === null) {
        setIsFirstTime(true);
        localStorage.setItem(FIRST_TIME_KEY, "false");
      }

    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

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
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  }, [tasks, toast]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }, []);

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
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, text: newText.trim() } : task
      )
    );
  }, [tasks, toast]);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );
  const totalTasks = tasks.length;

  return {
    tasks,
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
