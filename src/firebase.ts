import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

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

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics in production only
let analytics = null;
if (process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

export { db, auth, storage, analytics };
export default app;
