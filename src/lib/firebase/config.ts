// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-190601892-688e1",
  "appId": "1:109713094391:web:02e85286831252319485f2",
  "apiKey": "AIzaSyCl750n68Zwp1gFqUv9uH3pq59KqMDCMk8",
  "authDomain": "studio-190601892-688e1.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "109713094391"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export { app };