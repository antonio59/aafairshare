import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const testConfig = {
  apiKey: 'test-api-key',
  projectId: 'test-project',
  authDomain: 'test-project.firebaseapp.com'
};

// Initialize Firebase with test config
const app = initializeApp(testConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to Firebase emulators
connectFirestoreEmulator(db, 'localhost', 8080);
connectAuthEmulator(auth, 'http://localhost:9099');

// Extend Jest matchers
expect.extend({
  toBeValidId(received) {
    const pass = typeof received === 'string' && received.length > 0;
    return {
      message: () => `expected ${received} to be a valid ID string`,
      pass
    };
  }
});
