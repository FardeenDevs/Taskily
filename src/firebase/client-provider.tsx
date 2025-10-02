
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
  // By calling initializeFirebase() here at the top level of the component,
  // we ensure that it runs before any child components can render and try to access Firebase.
  // The useMemo hook ensures this initialization logic is executed only once per component lifecycle.
  const firebaseInstances = useMemo(() => initializeFirebase(), []);

  // Now, we can safely pass the initialized instances to the provider.
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
