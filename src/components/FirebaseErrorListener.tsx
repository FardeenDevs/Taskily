
"use client";

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A client component that listens for Firestore permission errors and throws
 * them to be caught by the Next.js development error overlay.
 *
 * This is invaluable for debugging security rules locally.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // Throw the error so Next.js can display its error overlay
      // This is only for development, it will not happen in production.
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
            throw error;
        }, 0)
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component does not render anything
}
