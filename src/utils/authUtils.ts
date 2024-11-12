import { auth } from '../firebase';

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
