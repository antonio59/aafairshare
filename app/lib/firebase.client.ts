// CLIENT-SIDE ONLY FIREBASE IMPLEMENTATION
// This file should only be imported from client components

// Use modular SDK
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, collection, doc, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { createFirebaseConfig, validateFirebaseConfig, type FirebaseEnv } from './firebase.shared';

// Firebase services (will be initialized later)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let functions: Functions;

// Initialize Firebase using modular SDK and window.ENV
// This function should only be called once ENV is available
function initializeFirebase() {
  // Check if already initialized
  if (getApps().length > 0) {
    app = getApp(); // Get existing app
    return { app, auth, db, functions };
  }

  // Get config from window.ENV
  const envConfig = window.ENV as FirebaseEnv;
  if (!envConfig) {
    throw new Error('Firebase ENV config not found on window object.');
  }

  const firebaseConfig = createFirebaseConfig(envConfig);
  
  // Validate configuration
  if (!validateFirebaseConfig(firebaseConfig)) {
    throw new Error('Invalid Firebase configuration.');
  }

  // Initialize Firebase app and services
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);

    // Configure auth persistence
    setPersistence(auth, browserLocalPersistence)
      .catch(error => {
        console.error("Failed to set Firebase auth persistence:", error);
      });

    return { app, auth, db, functions };

  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

// Helper functions for Firestore operations using modular SDK
function getCollection(collectionName: string) {
  if (!db) {
    try {
      const services = initializeFirebase();
      db = services.db;
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      return null;
    }
  }
  return collection(db, collectionName);
}

function getDocument(documentPath: string) {
  if (!db) {
    try {
      const services = initializeFirebase();
      db = services.db;
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      return null;
    }
  }
  return doc(db, documentPath);
}

// Remove immediate initialization on module load
// Initialization should be triggered explicitly when ENV is ready

// Export the initialized services and the initialization function
export {
  // firebase, // Don't export global firebase
  auth,
  db,
  functions,
  initializeFirebase,
  getCollection,
  getDocument
};
