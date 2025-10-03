
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { 
  getFirestore, 
  type Firestore, 
  initializeFirestore,
  persistentLocalCache,
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";
import { firebaseConfig } from "./config";

// Provides a singleton pattern for Firebase instances.
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (typeof window !== "undefined") {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      auth = getAuth(firebaseApp);
      // Use initializeFirestore for modern persistence setup
      firestore = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
      });
    } else {
      firebaseApp = getApp();
      auth = getAuth(firebaseApp);
      // Ensure firestore is initialized if it hasn't been already
      try {
        firestore = getFirestore(firebaseApp);
      } catch (e) {
         firestore = initializeFirestore(firebaseApp, {
          localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED }),
        });
      }
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
