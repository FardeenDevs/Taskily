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
  setDoc,
  getDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Task, UserProfile } from '@/lib/types';
import { app } from './config';

const db = getFirestore(app);

// Task Functions
export async function getTasks(userId: string): Promise<Task[]> {
  if (!userId) {
    console.error('User ID is required to fetch tasks.');
    return [];
  }
  try {
    const tasksCol = collection(db, 'users', userId, 'tasks');
    const q = query(tasksCol, orderBy('createdAt', 'asc'));
    const taskSnapshot = await getDocs(q);
    const tasks = taskSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            text: data.text,
            completed: data.completed,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        }
    }) as Task[];
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks from Firestore:', error);
    return [];
  }
}

export async function addTaskToFirestore(userId: string, task: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to add a task.');
  }
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const docRef = await addDoc(tasksCol, {
    ...task,
    createdAt: Timestamp.now(),
  });
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

// User Profile Functions
export async function createUserProfile(userId: string, data: UserProfile): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to create a user profile.');
  }
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    return null;
  }
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  } else {
    return null;
  }
}
