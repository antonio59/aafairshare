import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC8zIGv9XeuAG6gP2rXPih9tixN1zq0JYo",
  authDomain: "aafairshare.firebaseapp.com",
  projectId: "aafairshare",
  storageBucket: "aafairshare.firebasestorage.app",
  messagingSenderId: "326349848500",
  appId: "1:326349848500:web:7501876b1017cb553c3ce1",
  measurementId: "G-WRLHGN1BER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics if not in development
let analytics = null;
if (process.env.NODE_ENV !== 'development') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization skipped in development');
  }
}

// Use emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    // Only connect to emulators if they're running
    fetch('http://localhost:8080')
      .then(() => {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase emulators');
      })
      .catch(() => {
        console.log('Firebase emulators not detected, using production environment');
      });
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
  }
}

// Enable offline persistence only if not already enabled
let persistenceEnabled = false;
const enablePersistence = async () => {
  if (!persistenceEnabled) {
    try {
      await enableIndexedDbPersistence(db);
      persistenceEnabled = true;
      console.log('Firestore persistence enabled');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else {
        console.error('Failed to enable persistence:', err);
      }
    }
  }
};

// Try to enable persistence
enablePersistence();

export { db, auth, analytics };
export default app;
