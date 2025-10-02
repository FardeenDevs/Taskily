"use client";

import { useCollection as useFirebaseCollection } from 'react-firebase-hooks/firestore';
import type { CollectionReference, DocumentData, Query } from "firebase/firestore";

export function useCollection<T = DocumentData>(
  query?: CollectionReference<T> | Query<T> | null
) {
  const [snapshot, loading, error] = useFirebaseCollection(query);

  const data = snapshot?.docs.map(doc => ({ ...doc.data(), id: doc.id }));

  return { data, loading, error, snapshot };
}
