// Import Firebase compat version (v9 with v8 compatibility layer)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

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
  // Only initialize Firebase in the browser
  if (!isBrowser) {
    console.log('Server-side rendering, using dummy Firebase implementation');
    // Return mock implementations for server-side rendering
    return {
      app: {} as firebase.app.App,
      auth: {} as firebase.auth.Auth,
      db: {} as firebase.firestore.Firestore,
      functions: {} as firebase.functions.Functions
    };
  }

  try {
    // Check if Firebase is already initialized
    if (firebase.apps.length > 0) {
      console.log('Firebase already initialized, using existing app');
      app = firebase.apps[0];
    } else {
      // Initialize Firebase in the browser
      console.log('Initializing Firebase');
      app = firebase.initializeApp(firebaseConfig);
    }

    // Initialize services
    auth = app.auth();
    db = app.firestore();
    functions = app.functions();

    // Configure auth persistence
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .catch(error => {
        console.error("Failed to set Firebase auth persistence:", error);
      });

    return { app, auth, db, functions };
  } catch (error) {
    console.error('Error initializing Firebase:', error);

    // Provide dummy implementations for error cases
    auth = {} as firebase.auth.Auth;
    db = {} as firebase.firestore.Firestore;
    functions = {} as firebase.functions.Functions;
    app = {} as firebase.app.App;

    throw error;
  }
}

// Helper functions for Firestore operations
function getCollection(collectionName: string) {
  // Only run on client side
  if (!isBrowser) {
    console.log('Attempted to access Firestore collection on server');
    return null;
  }

  // Make sure db is initialized
  if (!db || typeof db.collection !== 'function') {
    console.error('Firestore not initialized when trying to access collection');
    return null;
  }

  return db.collection(collectionName);
}

function getDocument(path: string) {
  // Only run on client side
  if (!isBrowser) {
    console.log('Attempted to access Firestore document on server');
    return null;
  }

  // Make sure db is initialized
  if (!db || typeof db.doc !== 'function') {
    console.error('Firestore not initialized when trying to access document');
    return null;
  }

  return db.doc(path);
}

// Initialize Firebase immediately if in browser
if (isBrowser) {
  try {
    const services = initializeFirebase();
    app = services.app;
    auth = services.auth;
    db = services.db;
    functions = services.functions;
  } catch (error) {
    console.error('Failed to initialize Firebase on module load:', error);
  }
} else {
  // Server-side initialization with mock objects
  app = {} as firebase.app.App;
  auth = {} as firebase.auth.Auth;
  db = {} as firebase.firestore.Firestore;
  functions = {} as firebase.functions.Functions;
}

// Export the initialized services and helper functions
export { firebase, auth, db, functions, initializeFirebase, getCollection, getDocument, isBrowser };
