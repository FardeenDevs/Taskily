'use server';

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { app } from './config';

const db = getFirestore(app);

export async function getTasks(userId: string): Promise<Task[]> {
  if (!userId) {
    console.error('User ID is required to fetch tasks.');
    return [];
  }
  try {
    const tasksCol = collection(db, 'users', userId, 'tasks');
    const taskSnapshot = await getDocs(tasksCol);
    const tasks = taskSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Task[];
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks from Firestore:', error);
    return [];
  }
}

export async function addTaskToFirestore(userId: string, task: Omit<Task, 'id'>): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to add a task.');
  }
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const docRef = await addDoc(tasksCol, task);
  return docRef.id;
}

export async function updateTaskInFirestore(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
   if (!userId) {
    throw new Error('User ID is required to update a task.');
  }
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await updateDoc(taskRef, updates);
}

export async function deleteTaskFromFirestore(userId: string, taskId: string): Promise<void> {
   if (!userId) {
    throw new Error('User ID is required to delete a task.');
  }
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
}