import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const clearAuthCache = async () => {
  try {
    // Only clear Firebase specific storage
    const firebaseKeys = Object.keys(sessionStorage).filter(
      key => key.includes('firebase') || key.includes('firebaseapp')
    );
    firebaseKeys.forEach(key => sessionStorage.removeItem(key));

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

export const validatePassword = (password: string): boolean => {
  // Minimum 8 characters, at least one uppercase letter, one lowercase letter, 
  // one number and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const handleAuthError = async (error: unknown) => {
  console.error('Authentication error:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('auth/invalid-credential') ||
        error.message.includes('auth/user-token-expired')) {
      await clearAuthCache();
    }
  }
  
  throw error;
};
