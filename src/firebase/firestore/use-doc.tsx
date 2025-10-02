
"use client";

import { useEffect, useState } from 'react';
import { onSnapshot, type DocumentReference, type DocumentData } from "firebase/firestore";
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T = DocumentData>(
  docRef?: DocumentReference<T> | null
) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  
  useEffect(() => {
    if (!docRef) {
        setData(undefined);
        setLoading(false);
        return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        const newData = snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as T : undefined;
        setData(newData);
        setLoading(false);
        setError(undefined);
      },
      (err) => {
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [docRef]);


  return { data, loading, error };
}

    