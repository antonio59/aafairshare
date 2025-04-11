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
  console.log('Attempting Firebase initialization...');

  // Check if already initialized
  if (getApps().length > 0) {
    console.log('Firebase already initialized.');
    app = getApp(); // Get existing app
  } else {
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

    console.log('Initializing new Firebase app with validated config.');
    app = initializeApp(firebaseConfig);
  }

  // Initialize services using modular functions
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app); // Optional: specify region if needed

    // Configure auth persistence
    setPersistence(auth, browserLocalPersistence)
      .catch(error => {
        console.error("Failed to set Firebase auth persistence:", error);
      });

    console.log('Firebase services obtained successfully.');
    return { app, auth, db, functions };

  } catch (error) {
    console.error('Error obtaining Firebase services:', error);
    // Clean up potentially partially initialized app if services fail
    // Note: Firebase doesn't have a standard 'deleteApp' in v9+ client SDK easily accessible here
    // Consider logging the error and letting the app handle the failure state
    throw error; // Re-throw error after logging
  }
}

// Helper functions for Firestore operations using modular SDK
function getCollection(collectionName: string) {
  if (!db) {
    console.error('Firestore not initialized when trying to access collection:', collectionName);
    // Attempt to initialize if not already done (e.g., on direct import/use)
    try {
      console.log('Attempting lazy initialization for getCollection');
      const services = initializeFirebase();
      db = services.db; // Update local db instance
    } catch (error) {
      console.error('Lazy initialization failed for getCollection:', error);
      // Depending on requirements, you might throw an error or return null/undefined
      // Returning null here to indicate failure to get the collection ref
      return null;
    }
  }
  // Use modular 'collection' function
  return collection(db, collectionName);
}

function getDocument(documentPath: string) {
   if (!db) {
    console.error('Firestore not initialized when trying to access document:', documentPath);
    // Attempt to initialize if not already done
    try {
      console.log('Attempting lazy initialization for getDocument');
      const services = initializeFirebase();
      db = services.db; // Update local db instance
    } catch (error) {
      console.error('Lazy initialization failed for getDocument:', error);
      return null; // Indicate failure
    }
  }
  // Use modular 'doc' function
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
