
"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { FirebaseProvider } from "./provider";
import { initializeFirebase } from ".";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseInstances, setFirebaseInstances] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    // This function initializes Firebase and sets the instances in state.
    // It runs only once on the client-side.
    const instances = initializeFirebase();
    setFirebaseInstances(instances);
  }, []);

  // If Firebase is not yet initialized, we can show a loading state
  // or simply not render the children that depend on it.
  if (!firebaseInstances) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  // Once Firebase is initialized, render the provider and its children.
  return (
    <FirebaseProvider
      app={firebaseInstances.app}
      auth={firebaseInstances.auth}
      firestore={firebaseInstances.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
