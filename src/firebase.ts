import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC8zIGv9XeuAG6gP2rXPih9tixN1zq0JYo",
  authDomain: "aafairshare.firebaseapp.com",  // Changed back to Firebase default domain
  projectId: "aafairshare",
  storageBucket: "aafairshare.appspot.com",
  messagingSenderId: "326349848500",
  appId: "1:326349848500:web:7501876b1017cb553c3ce1",
  measurementId: "G-WRLHGN1BER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with enhanced settings
const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50 MB cache size
  experimentalForceLongPolling: true, // Better offline support
});

// Enable multi-tab persistence for Firestore
if (process.env.NODE_ENV === 'production') {
  enableMultiTabIndexedDbPersistence(db)
    .catch((err) => {
      console.error('Error enabling Firestore persistence:', err);
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      }
    });
}

// Initialize Auth with enhanced persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics only in production
let analytics = null;
if (process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Use emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firebase emulators successfully');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

// Enhanced auth state monitoring with error logging
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User authenticated:', user.email);
  } else {
    console.log('User signed out or no user');
  }
}, (error) => {
  console.error('Auth state change error:', error);
});

// Export configured instances
export { db, auth, storage, analytics };
export default app;
