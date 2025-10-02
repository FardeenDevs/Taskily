"use client";

import { useDocument } from 'react-firebase-hooks/firestore';
import type { DocumentReference, DocumentData } from "firebase/firestore";

export function useDoc<T = DocumentData>(
  docRef?: DocumentReference<T> | null
) {
  const [snapshot, loading, error] = useDocument(docRef);

  const data = snapshot?.exists() ? { ...snapshot.data(), id: snapshot.id } : undefined;

  return { data, loading, error, snapshot };
}
