import type { User } from '@/types';
import { AuthError } from '@supabase/supabase-js';
import { getSupabase } from '../supabase';

// Get the auth instance from the Supabase client
export const auth = getSupabase().auth;

export const reauthenticateWithPassword = async (email: string, password: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

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
    const supabase = getSupabase();
    await supabase.auth.signOut();

    console.log('Auth cache cleared successfully');
  } catch (error) {
    console.error('Error clearing auth cache:', error);
    throw error; // Propagate error for handling
  }
};

export const validateAuthToken = async () => {
  try {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth token validation error:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Check if token is expired
    const tokenExpiry = new Date((session.expires_at || 0) * 1000);
    const now = new Date();
    
    if (tokenExpiry <= now) {
      console.log('Session token is expired');
      return false;
    }
    
    console.log('Auth token is valid');
    return true;
  } catch (error) {
    console.error('Error validating auth token:', error);
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

// Utility function to check if session needs refresh
export const checkTokenRefreshNeeded = async (): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const expirationTime = new Date(session.expires_at!).getTime();
    const currentTime = new Date().getTime();

    // Return true if session expires in less than 5 minutes
    return (expirationTime - currentTime) < 5 * 60 * 1000;
  } catch (error) {
    console.error('Error checking session refresh:', error);
    return true; // Err on the side of caution
  }
};

// Re-authenticate user with stored credentials
export const reAuthenticateUser = async (email: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('No authenticated user');
    }

    // Get stored password from secure storage
    const storedPassword = localStorage.getItem('tempPassword');
    if (!storedPassword) {
      throw new Error('No stored credentials found');
    }

    // Re-authenticate
    await reauthenticateWithPassword(email, storedPassword);

    // Refresh session
    await supabase.auth.refreshSession();

  } catch (error) {
    console.error('Re-authentication failed:', error);
    await clearAuthCache();
    throw error;
  }
};
