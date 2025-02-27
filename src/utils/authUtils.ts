'use client';

import type { User } from '@/types';
import { AuthError } from '@supabase/supabase-js';
import { getSupabase } from '@/supabase';

const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // 5 minutes in ms

// Get the auth instance from the Supabase client
export const auth = getSupabase().auth;

/**
 * Checks if the current user session is valid
 * @returns A promise that resolves to a boolean indicating if the session is valid
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
    
    if (!session) {
      console.log('No session found');
      return false;
    }
    
    // Check if token is close to expiring
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0; // convert to ms
    const now = Date.now();
    
    if (expiresAt && expiresAt - now < TOKEN_REFRESH_MARGIN) {
      console.log('Session is about to expire, refreshing...');
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
        return false;
      }
      
      console.log('Session refreshed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in isSessionValid:', error);
    return false;
  }
}

/**
 * Gets the current user information from the session
 * @returns User data if available, null otherwise
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Helper function to get user metadata in a safe way
 * @param key The key to look for in the metadata
 * @returns The value if found, null otherwise
 */
export async function getUserMetadata(key: string): Promise<any> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.user_metadata) {
      return null;
    }
    
    return user.user_metadata[key] ?? null;
  } catch (error) {
    console.error(`Error getting user metadata for key ${key}:`, error);
    return null;
  }
}

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
