
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Provides a singleton pattern for Firebase instances.
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let persistenceEnabled = false;

function initializeFirebase() {
  if (typeof window !== "undefined") {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);

      if (!persistenceEnabled) {
        enableIndexedDbPersistence(firestore, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
          .then(() => {
            persistenceEnabled = true;
          })
          .catch((err) => {
            if (err.code == 'failed-precondition') {
              console.warn('Firestore persistence failed: multiple tabs open.');
            } else if (err.code == 'unimplemented') {
              console.warn('Firestore persistence not supported in this browser.');
            }
          });
      }
    } else {
      firebaseApp = getApp();
      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);
    }
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
