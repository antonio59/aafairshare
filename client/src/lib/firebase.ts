console.log("--- firebase.ts module executing ---"); // Add this log
/// <reference types="vite/client" />
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth"; // Revert to getAuth and setPersistence
import { getFirestore, Firestore } from "firebase/firestore";

// --- NEW Firebase Configuration ---
// Load config from environment variables (Vite convention: prefix with VITE_)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Basic validation to ensure environment variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration environment variables are missing!");
  // You might want to throw an error or handle this case more gracefully
}


// Log the config before initializing

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
console.log("--- Firebase Auth object initialized (getAuth):", auth); // Updated log

// Configure auth persistence and settings asynchronously
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence set to browserLocalPersistence.");
  })
  .catch((error) => {
    console.error("!!!!!!!!!! FAILED TO SET FIREBASE AUTH PERSISTENCE !!!!!!!!!!", error);
  });
 
const db: Firestore = getFirestore(app);
 
// Removed emulator connection logic
 
// Export the initialized services
export { app, auth, db };
