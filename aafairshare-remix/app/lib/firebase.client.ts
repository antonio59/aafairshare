// CLIENT-SIDE ONLY FIREBASE IMPLEMENTATION
// This file should only be imported from client components

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

// Define global types for TypeScript
declare global {
  interface Window {
    firebase: typeof firebase;
    ENV?: {
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID?: string;
    };
    debugInfo?: {
      timestamp: string;
      userAgent: string;
      url: string;
      errors: string[];
    };
  }
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYLQoJRCZ9ynyASEQ0zNWez9GUeNG4qsg",
  authDomain: "aafairshare-37271.firebaseapp.com",
  projectId: "aafairshare-37271",
  storageBucket: "aafairshare-37271.appspot.com",
  messagingSenderId: "121020031141",
  appId: "1:121020031141:web:c56c04b654aae5cfd76d4c"
};

// Define Firebase services
let app: firebase.app.App;
let auth: firebase.auth.Auth;
let db: firebase.firestore.Firestore;
let functions: firebase.functions.Functions;

// Initialize Firebase - this function can be called multiple times safely
function initializeFirebase() {
  console.log('Initializing Firebase in client');

  try {
    // Check if Firebase is already initialized
    if (firebase.apps.length > 0) {
      console.log('Firebase already initialized, using existing app');
      app = firebase.apps[0];
    } else {
      // Initialize Firebase in the browser
      console.log('Creating new Firebase app');
      app = firebase.initializeApp(firebaseConfig);
    }

    // Initialize services
    auth = app.auth();
    db = app.firestore();
    functions = app.functions();

    // Verify services are properly initialized
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Firestore db object is not properly initialized');
    }

    if (!auth || typeof auth.signInWithPopup !== 'function') {
      throw new Error('Firebase Auth object is not properly initialized');
    }

    // Configure auth persistence
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(error => {
        console.error("Failed to set Firebase auth persistence:", error);
      });

    console.log('Firebase services initialized successfully');
    return { app, auth, db, functions };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

// Helper functions for Firestore operations
function getCollection(collectionName: string) {
  if (!db || typeof db.collection !== 'function') {
    console.error('Firestore not initialized when trying to access collection');
    // Try to initialize Firebase
    try {
      const services = initializeFirebase();
      db = services.db;
    } catch (error) {
      console.error('Failed to initialize Firebase when accessing collection:', error);
      return null;
    }
  }

  return db.collection(collectionName);
}

function getDocument(path: string) {
  if (!db || typeof db.doc !== 'function') {
    console.error('Firestore not initialized when trying to access document');
    // Try to initialize Firebase
    try {
      const services = initializeFirebase();
      db = services.db;
    } catch (error) {
      console.error('Failed to initialize Firebase when accessing document:', error);
      return null;
    }
  }

  return db.doc(path);
}

// Initialize Firebase immediately
try {
  const services = initializeFirebase();
  // Update the global variables with the initialized services
  app = services.app;
  auth = services.auth;
  db = services.db;
  functions = services.functions;
  console.log('Firebase initialized on module load');
} catch (error) {
  console.error('Failed to initialize Firebase on module load:', error);
}

// Export the initialized services and the initialization function
export {
  firebase,
  auth,
  db,
  functions,
  initializeFirebase,
  getCollection,
  getDocument
};
