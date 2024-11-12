import { auth } from '../firebase';
import { signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export const clearAuthCache = async () => {
  try {
    // Clear all Firebase and authentication related storage
    const itemsToClear = [
      ...Object.keys(sessionStorage).filter(key => 
        key.includes('firebase') || 
        key.includes('firebaseapp') ||
        key.includes('auth')
      ),
      ...Object.keys(localStorage).filter(key => 
        key.includes('firebase') || 
        key.includes('firebaseapp') ||
        key.includes('auth')
      )
    ];

    // Clear items from both storage types
    itemsToClear.forEach(key => {
      try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove key: ${key}`, e);
      }
    });

    // Clear any existing auth tokens
    const user = auth.currentUser;
    if (user) {
      try {
        await user.getIdToken(true); // Force token refresh
      } catch (e) {
        console.warn('Failed to refresh token:', e);
      }
    }

    console.log('Firebase auth cache cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cache:', error);
    throw error; // Propagate error for handling
  }
};

export const validateAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    // Get current token
    const token = await user.getIdToken();
    if (!token) {
      return false;
    }

    // Verify token expiration
    const decodedToken = await user.getIdTokenResult();
    const expirationTime = new Date(decodedToken.expirationTime).getTime();
    const currentTime = new Date().getTime();

    // If token is close to expiration (within 5 minutes), refresh it
    if (expirationTime - currentTime < 5 * 60 * 1000) {
      await user.getIdToken(true); // Force token refresh
    }

    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    await clearAuthCache(); // Clear cache on validation failure
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
    const errorMessage = error.message.toLowerCase();
    if (
      errorMessage.includes('auth/invalid-credential') ||
      errorMessage.includes('auth/user-token-expired') ||
      errorMessage.includes('auth/invalid-token') ||
      errorMessage.includes('auth/network-request-failed')
    ) {
      await clearAuthCache();
      
      // Additional cleanup for specific error types
      if (errorMessage.includes('auth/network-request-failed')) {
        // Wait briefly before retry on network errors
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw error;
};

// Utility function to check if token needs refresh
export const checkTokenRefreshNeeded = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const decodedToken = await user.getIdTokenResult();
    const expirationTime = new Date(decodedToken.expirationTime).getTime();
    const currentTime = new Date().getTime();

    // Return true if token expires in less than 5 minutes
    return (expirationTime - currentTime) < 5 * 60 * 1000;
  } catch (error) {
    console.error('Error checking token refresh:', error);
    return true; // Err on the side of caution
  }
};

// Re-authenticate user with stored credentials
export const reAuthenticateUser = async (email: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Get stored password from secure storage
    const storedPassword = localStorage.getItem(`auth_${email}`);
    if (!storedPassword) {
      throw new Error('No stored credentials found');
    }

    // Create credential
    const credential = EmailAuthProvider.credential(email, storedPassword);

    // Re-authenticate
    await reauthenticateWithCredential(user, credential);

    // Force token refresh
    await user.getIdToken(true);

  } catch (error) {
    console.error('Re-authentication failed:', error);
    await clearAuthCache();
    throw error;
  }
};
