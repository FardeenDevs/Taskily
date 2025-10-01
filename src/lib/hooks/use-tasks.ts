"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { type Task } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getTasks, addTaskToFirestore, updateTaskInFirestore, deleteTaskFromFirestore } from "@/lib/firebase/firestore";

const FIRST_TIME_KEY = "taskily-first-time";

export function useTasks() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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

  const fetchTasks = useCallback(async (userId: string) => {
      setLoading(true);
      const firestoreTasks = await getTasks(userId);
      setTasks(firestoreTasks);
      setLoading(false);
  }, []);


  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    } else if (!authLoading) {
      // If user is not logged in and auth is not loading, clear tasks
      setTasks([]);
      setLoading(false);
    }
  }, [user, authLoading, fetchTasks]);

  const addTask = useCallback(async (text: string) => {
    if (text.trim() === "") return;
    if (!user) {
        toast({ title: "Please log in to add tasks", variant: "destructive" });
        return;
    }

    const normalizedText = text.trim().toLowerCase();
    if (tasks.some(task => task.text.toLowerCase() === normalizedText)) {
      toast({
        variant: "destructive",
        title: "Duplicate Task",
        description: "A task with this name already exists.",
      });
      return;
    }
    
    const newTaskData = {
      text: text.trim(),
      completed: false,
    };

    try {
        await addTaskToFirestore(user.uid, newTaskData);
        // Refetch tasks from firestore to ensure UI is in sync
        await fetchTasks(user.uid);
    } catch(error) {
        console.error("Error adding task:", error);
        toast({ title: "Failed to add task", variant: "destructive"});
    }

  }, [tasks, user, toast, fetchTasks]);

  const toggleTask = useCallback(async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompletedState = !task.completed;
    
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === id ? { ...t, completed: newCompletedState } : t
      )
    );

    try {
        await updateTaskInFirestore(user.uid, id, { completed: newCompletedState });
    } catch (error) {
        console.error("Error toggling task:", error);
        toast({ title: "Failed to update task", variant: "destructive"});
        // Revert UI change on failure
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.id === id ? { ...t, completed: !newCompletedState } : t
            )
        );
    }
  }, [tasks, user, toast]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;
    
    // Optimistic update
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

    try {
        await deleteTaskFromFirestore(user.uid, id);
    } catch(error) {
        console.error("Error deleting task:", error);
        toast({ title: "Failed to delete task", variant: "destructive"});
        // Revert UI change
        setTasks((prevTasks) => [...prevTasks, taskToDelete]);
    }
  }, [tasks, user, toast]);

  const editTask = useCallback(async (id: string, newText: string) => {
    if (newText.trim() === "") return;
     if (!user) return;

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
    
    const originalText = tasks.find(t => t.id === id)?.text || '';

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, text: newText.trim() } : task
      )
    );

    try {
      await updateTaskInFirestore(user.uid, id, { text: newText.trim() });
    } catch (error) {
      console.error("Error editing task:", error);
      toast({ title: "Failed to edit task", variant: "destructive"});
       // Revert UI change
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, text: originalText } : task
        )
      );
    }

  }, [tasks, user, toast]);

  const sortedTasks = useMemo(
    () => tasks.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
    }),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );
  const totalTasks = tasks.length;

  return {
    tasks: sortedTasks,
    loading: authLoading || loading,
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
