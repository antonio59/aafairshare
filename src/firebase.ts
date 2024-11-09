import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
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
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firestore emulator');
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Auth emulator');
  } catch (error) {
    console.warn('Failed to connect to emulators:', error);
  }
} else {
  console.log('Running in production mode');
}

export { db, auth, analytics };
export default app;
