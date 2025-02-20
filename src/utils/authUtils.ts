import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export class EmailAuthProvider {
  static async reauthenticateWithCredential(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }
}

export const auth = supabase.auth;

export const clearAuthCache = async () => {
  try {
    // Clear all Supabase and authentication related storage
    const itemsToClear = [
      ...Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('auth')
      ),
      ...Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('auth') ||
        key === 'tempPassword'
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

    // Sign out from Supabase
    await supabase.auth.signOut();

    console.log('Auth cache cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cache:', error);
    throw error; // Propagate error for handling
  }
};

export const validateAuthToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return false;
    }

    // Check if session is expired
    const expirationTime = new Date(session.expires_at!).getTime();
    const currentTime = new Date().getTime();

    // If session is expired or close to expiration (within 5 minutes), refresh it
    if (expirationTime - currentTime < 5 * 60 * 1000) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Session refresh failed:', refreshError);
        await clearAuthCache();
        return false;
      }
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
    const storedPassword = localStorage.getItem('tempPassword');
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
