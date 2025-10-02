import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Provides a singleton pattern for Firebase instances.
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  // Enable offline persistence
  try {
    enableIndexedDbPersistence(firestore)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time.
          console.warn('Firestore persistence failed: multiple tabs open.');
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the features required to enable persistence.
          console.warn('Firestore persistence not supported in this browser.');
        }
      });
  } catch (error) {
      console.error("Firebase persistence error:", error);
  }


  return { app: firebaseApp, auth, firestore };
}

// Public API
export { initializeFirebase };
export * from "./provider";
export * from "./client-provider";
export * from "./auth/use-user";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";
