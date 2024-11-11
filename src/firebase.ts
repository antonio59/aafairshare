import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC8zIGv9XeuAG6gP2rXPih9tixN1zq0JYo",
  authDomain: "aafairshare.firebaseapp.com",
  projectId: "aafairshare",
  storageBucket: "aafairshare.appspot.com",
  messagingSenderId: "326349848500",
  appId: "1:326349848500:web:7501876b1017cb553c3ce1",
  measurementId: "G-WRLHGN1BER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with cache settings
const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50 MB cache size
  experimentalForceLongPolling: true, // Better offline support
});

// Initialize Auth with local persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence set to local');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize Storage with retry logic
const storage = getStorage(app);

// Initialize Analytics
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics initialization failed:', error);
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

// Log auth state changes for debugging
auth.onAuthStateChanged((user) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
  }
});

// Export configured instances
export { db, auth, storage, analytics };
export default app;
