import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
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

// Initialize Firestore with cache settings
const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50 MB cache size
  experimentalForceLongPolling: true, // Better offline support
});

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
    fetch('http://localhost:9099')
      .then(() => {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Connected to Firebase Auth emulator');
      })
      .catch(() => {
        console.log('Firebase emulators not detected, using production environment');
      });
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
  }
}

export { db, auth, analytics };
export default app;
