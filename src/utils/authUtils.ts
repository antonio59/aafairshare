import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const clearAuthCache = async () => {
  try {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB data
    const databases = await window.indexedDB.databases();
    databases.forEach(db => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });

    // Clear Firebase specific storage
    const firebaseKeys = Object.keys(localStorage).filter(
      key => key.includes('firebase') || key.includes('firebaseapp')
    );
    firebaseKeys.forEach(key => localStorage.removeItem(key));

    // Clear Zustand and other persisted stores
    Object.keys(localStorage).forEach(key => {
      if (key.includes('zustand') || key.includes('persist')) {
        localStorage.removeItem(key);
      }
    });

    console.log('Authentication cache cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cache:', error);
  }
};

export const validateAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Force token refresh
    const token = await user.getIdToken(true);
    console.log('Token validated successfully');
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

export const reAuthenticateUser = async (email: string) => {
  try {
    // Attempt to re-authenticate the user
    const storedPassword = localStorage.getItem('tempPassword');
    if (!storedPassword) {
      throw new Error('No stored credentials');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, storedPassword);
    console.log('User re-authenticated successfully');
    return userCredential.user;
  } catch (error) {
    console.error('Re-authentication failed:', error);
    throw error;
  }
};

export const handleAuthError = async (error: unknown) => {
  console.error('Authentication error:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('auth/invalid-credential') ||
        error.message.includes('auth/user-token-expired') ||
        error.message.includes('permission-denied')) {
      console.log('Invalid credentials or token expired, attempting re-authentication...');
      // You might want to add logic to re-authenticate or prompt for login
    }
  }
  
  throw error;
};
