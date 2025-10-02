
"use client";

import { useEffect, useState } from 'react';
import { onSnapshot, type CollectionReference, type DocumentData, type Query } from "firebase/firestore";
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T = DocumentData>(
  query?: CollectionReference<T> | Query<T> | null
) {
  const [data, setData] = useState<T[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const newData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
        setData(newData);
        setLoading(false);
        setError(undefined);
      },
      (err) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: query.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [query]);


  return { data, loading, error };
}

    