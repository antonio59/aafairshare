/// <reference types="vite/client" />
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
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
 
// Configure auth persistence and settings (original async call)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // auth.settings.appVerificationDisabledForTesting = false; // Example
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
 
const db: Firestore = getFirestore(app);
 
// Removed emulator connection logic
 
// Export the initialized services
export { app, auth, db };
