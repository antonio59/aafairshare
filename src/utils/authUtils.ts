import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const clearAuthCache = async () => {
  try {
    // Only clear Firebase specific storage
    const firebaseKeys = Object.keys(localStorage).filter(
      key => key.includes('firebase') || key.includes('firebaseapp')
    );
    firebaseKeys.forEach(key => localStorage.removeItem(key));

    console.log('Firebase auth cache cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cache:', error);
  }
};

export const validateAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    // Force token refresh
    await user.getIdToken(true);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

export const reAuthenticateUser = async (email: string) => {
  try {
    const storedPassword = localStorage.getItem('tempPassword');
    if (!storedPassword) {
      throw new Error('No stored credentials for re-authentication');
    }

    // Attempt to re-authenticate
    const userCredential = await signInWithEmailAndPassword(auth, email, storedPassword);
    console.log('User re-authenticated successfully');
    
    // Get fresh token
    await userCredential.user.getIdToken(true);
    
    return userCredential.user;
  } catch (error) {
    console.error('Re-authentication failed:', error);
    // Clear stored credentials on failure
    localStorage.removeItem('tempPassword');
    throw error;
  }
};

export const handleAuthError = async (error: unknown) => {
  console.error('Authentication error:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('auth/invalid-credential') ||
        error.message.includes('auth/user-token-expired')) {
      // Only clear Firebase-specific storage on auth errors
      await clearAuthCache();
    }
  }
  
  throw error;
};
