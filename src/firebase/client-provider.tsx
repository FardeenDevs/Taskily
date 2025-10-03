
"use client";
import React, { ReactNode, useMemo } from "react";
import { FirebaseProvider } from "./provider";
import { initializeFirebase } from ".";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const firebaseInstances = useMemo(() => initializeFirebase(), []);

  // firebaseInstances might be undefined on the first server render, 
  // so we should only render the provider when they are available on the client.
  if (!firebaseInstances?.app) {
    return <>{children}</>;
  }

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
