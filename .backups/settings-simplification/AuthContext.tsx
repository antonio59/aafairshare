import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../api/supabase';
// We're keeping this import for backward compatibility, but note that authClient is now just a reference to supabase
import { authClient } from '../api/auth-client';
import { createLogger } from '../utils/logger';
import {
  SupabaseUser,
  UserProfile,
  AuthContextType as AuthContextInterface,
  AuthResponse,
  AuthEvent
} from '../types/users';

// Create a logger for this module
const logger = createLogger('AuthContext');

// Define a type for JSON data from Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Define proper types for the user and profile objects
interface SupabaseUserRecord {
  id: string;
  email: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextInterface | null>(null);

// Add retry logic for auth operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    // Log operation attempt
    logger.debug('Attempting operation', { retriesLeft: retries });
    return await operation();
  } catch (error) {
    // Enhanced error logging
    logger.error('Operation error', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      retriesLeft: retries
    });
    
    // Handle more error types - retry on network issues, timeouts, and auth errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const shouldRetry = (
      retries > 0 && (
        errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('401') || // Unauthorized errors
        errorMessage.includes('Auth')    // Auth-related errors
      )
    );
    
    if (shouldRetry) {
      logger.warn('Retrying operation', {
        retriesLeft: retries - 1,
        errorMessage,
        delayMs: delay
      });
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 1.5); // Increase delay with each retry
    }
    
    // If we shouldn't retry, rethrow the error
    throw error;
  }
}

// No need to sync sessions anymore since we're using a single client
// Remove syncSessions function

/**
 * Auth Provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState<number>(0);

  /**
   * Helper function to create a user profile in the database
   */
  const createUserProfile = useCallback(async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
    try {
      logger.info('Creating new user profile', { userId });
      
      const newProfile = {
        id: userId,
        email,
        name: name || email.split('@')[0], // Use part of email if no name provided
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Log creation attempt
      logger.debug('Attempting to create user profile with data:', newProfile);
      
      const { data, error } = await supabase
        .from('users')
        .insert(newProfile)
        .select()
        .single();
        
      if (error) {
        logger.error('Error creating user profile', error);
        return null;
      }
      
      logger.info('User profile created successfully', { userId });
      
      // Type assertion to ensure we get the right type
      return data as unknown as UserProfile;
    } catch (error) {
      logger.error('Exception creating user profile:', error);
      return null;
    }
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      logger.debug('Fetching user profile', { userId });
      
      // Get user data from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        logger.error('Error fetching user profile', error);
        return null;
      }
      
      if (data) {
        logger.debug('User profile found', { userId });
        logger.debug('Raw profile data:', data);
        
        // Safely cast the Supabase data to our UserProfile type
        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          name: data.name,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        return userProfile;
      }
      
      logger.warn('No user profile found', { userId });
      return null;
    } catch (error) {
      logger.error('Exception fetching user profile:', error);
      return null;
    }
  }, []);

  // Updated profile handling
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      // First check that we have a user
      if (!user) {
        logger.error('Cannot update profile: No user authenticated');
        return null;
      }
      
      const userId = user.id;
      logger.debug('Updating user profile', { userId, data });
      
      // Get current profile first to ensure we have the latest data
      const currentProfile = await fetchUserProfile(userId);
      
      if (!currentProfile) {
        logger.error('Cannot update profile: No existing profile found');
        return null;
      }
      
      // Merge current profile with updates
      const updates = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      // Update the profile in the database
      const { data: updatedData, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating user profile', error);
        return null;
      }
      
      // Update local state
      const updatedProfile = updatedData as unknown as UserProfile;
      setProfile(updatedProfile);
      
      logger.info('User profile updated successfully', { userId });
      return updatedProfile;
    } catch (error) {
      logger.error('Exception updating user profile:', error);
      return null;
    }
  }, [user, fetchUserProfile]);

  /**
   * Get the current session and user details
   */
  const getSession = async () => {
    try {
      logger.debug('Getting session');
      
      // Only need to get from one client now
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Error getting session', error);
        setAuthError(error.message);
        setLoading(false);
        return;
      }
      
      // If we have a session and user, set them
      if (data?.session?.user) {
        const authUser = data.session.user;
        logger.info('User authenticated', { userId: authUser.id });
        
        setUser(authUser);
        
        // If we're authenticated, try to get the profile
        try {
          let userProfile = await fetchUserProfile(authUser.id);
          
          // If no profile exists but we have a user, create a default one
          if (!userProfile) {
            logger.warn('No user profile found, creating default profile', { userId: authUser.id });
            
            // Create a default profile
            userProfile = await createUserProfile(
              authUser.id,
              authUser.email || 'unknown@example.com',
              authUser.user_metadata?.name || ''
            );
            
            if (!userProfile) {
              logger.error('Failed to create default profile', { userId: authUser.id });
            }
          }
          
          setProfile(userProfile);
        } catch (profileError) {
          logger.error('Error fetching/creating user profile', profileError);
        }
      } else {
        // No user, clear out state
        logger.debug('No authenticated user found');
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    } catch (error) {
      logger.error('Exception in getSession', error);
      setLoading(false);
      setAuthError('Failed to initialize auth: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Initial auth state setup
  useEffect(() => {
    logger.debug('AuthProvider mounted, initializing auth state');
    getSession();
    
    // Set up auth state change listeners
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Auth state changed', { event, hasSession: !!session });
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            logger.info('User signed in or token refreshed', { userId: session.user.id });
            setUser(session.user);
            
            // Fetch or create profile
            const userProfile = await fetchUserProfile(session.user.id);
            
            if (userProfile) {
              setProfile(userProfile);
            } else {
              // Try to create a default profile if none exists
              logger.warn('No profile found for logged in user, creating default', { userId: session.user.id });
              const newProfile = await createUserProfile(
                session.user.id,
                session.user.email || 'unknown@example.com',
                session.user.user_metadata?.name || ''
              );
              
              if (newProfile) {
                setProfile(newProfile);
              } else {
                logger.error('Failed to create user profile on sign in', { userId: session.user.id });
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          logger.info('User signed out');
          setUser(null);
          setProfile(null);
        } else if (event === 'USER_UPDATED') {
          logger.info('User updated, refreshing session');
          // Just refresh the session to get the latest user data
          getSession();
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      logger.debug('AuthProvider unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Handle sign-in
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      logger.info('Signing in user', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        logger.error('Sign-in error', error);
        setAuthError(error.message);
        return { success: false, message: error.message };
      }
      
      if (data.user) {
        logger.info('User signed in successfully', { userId: data.user.id });
        setUser(data.user);
        
        // Get the user profile
        const userProfile = await fetchUserProfile(data.user.id);
        
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Create a default profile if none exists
          logger.warn('No profile found after sign-in, creating default', { userId: data.user.id });
          const newProfile = await createUserProfile(
            data.user.id,
            data.user.email || 'unknown@example.com',
            data.user.user_metadata?.name || ''
          );
          
          if (newProfile) {
            setProfile(newProfile);
          }
        }
        
        setAuthError(null);
        return { success: true, user: data.user };
      }
      
      logger.error('Sign-in returned no user');
      return { success: false, message: 'Authentication failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Exception during sign-in:', error);
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [fetchUserProfile, createUserProfile]);

  // Handle sign-up
  const signUp = useCallback(async (email: string, password: string, name: string): Promise<AuthResponse> => {
    try {
      logger.info('Signing up new user', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        logger.error('Sign-up error', error);
        setAuthError(error.message);
        return { success: false, message: error.message };
      }
      
      if (data.user) {
        logger.info('User signed up successfully', { userId: data.user.id });
        setUser(data.user);
        
        // Create user profile
        const userProfile = await createUserProfile(data.user.id, email, name);
        
        if (userProfile) {
          setProfile(userProfile);
        } else {
          logger.error('Failed to create profile for new user', { userId: data.user.id });
        }
        
        setAuthError(null);
        
        return {
          success: true,
          user: data.user,
          message: 'Account created successfully'
        };
      }
      
      logger.error('Sign-up returned no user');
      return { success: false, message: 'Sign-up failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Exception during sign-up:', error);
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [createUserProfile]);
  
  // Handle sign-out
  const signOut = useCallback(async (): Promise<{ success: boolean }> => {
    try {
      logger.info('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign-out error', error);
        setAuthError(error.message);
        return { success: false };
      }
      
      // Clear user state
      setUser(null);
      setProfile(null);
      setAuthError(null);
      
      logger.info('User signed out successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Exception during sign-out:', error);
      setAuthError(errorMessage);
      return { success: false };
    }
  }, []);

  // Refresh the user session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const now = Date.now();
      
      // Prevent multiple rapid refresh attempts
      if (now - lastRefreshAttempt < 5000) {
        logger.warn('Refresh attempt too soon after previous attempt');
        return false;
      }
      
      setLastRefreshAttempt(now);
      logger.info('Refreshing auth session');
      
      // Check if we have current session data
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Error getting session during refresh', error);
        return false;
      }
      
      // If we have a valid session but no user in state, initialize
      if (data?.session && !user) {
        logger.info('Valid session found during refresh, initializing user');
        
        // Refresh user state
        setUser(data.session.user);
        
        // Get the user profile
        if (data.session.user.id) {
          const userProfile = await fetchUserProfile(data.session.user.id);
          
          if (userProfile) {
            setProfile(userProfile);
          } else {
            logger.warn('No profile found during refresh, creating default', { userId: data.session.user.id });
            
            // Create default profile
            const newProfile = await createUserProfile(
              data.session.user.id,
              data.session.user.email || 'unknown@example.com', 
              data.session.user.user_metadata?.name || ''
            );
            
            if (newProfile) {
              setProfile(newProfile);
            }
          }
        }
        
        return true;
      }
      
      return !!data?.session;
    } catch (error) {
      logger.error('Exception during session refresh:', error);
      return false;
    }
  }, [user, lastRefreshAttempt, fetchUserProfile, createUserProfile]);

  // Reset auth state (clear errors, refresh session)
  const resetAuthState = useCallback(async (): Promise<boolean> => {
    try {
      logger.info('Resetting auth state');
      
      // Clear any errors
      setAuthError(null);
      
      // Try to refresh session
      return await refreshSession();
    } catch (error) {
      logger.error('Exception during auth state reset:', error);
      return false;
    }
  }, [refreshSession]);

  // Clear any auth errors
  const clearError = useCallback((): void => {
    setAuthError(null);
  }, []);

  // Provide auth context to components
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signIn,
        signUp,
        signOut,
        fetchUserProfile,
        clearError,
        refreshSession,
        resetAuthState,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

const initialProfileData = async (userData: SupabaseUserRecord): Promise<UserProfile> => {
  try {
    // Normalize the profile data
    return {
      id: userData.id || '',
      email: userData.email || '',
      name: userData.name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    // Log the error but don't throw it, we still need to return a profile
    logger.error('Error normalizing user profile', error);
    // Fall back to basic profile data
    return {
      id: userData.id || '',
      email: userData.email || '',
      name: userData.name || '',
      created_at: null,
      updated_at: null
    };
  }
};

const formatProfile = (data: SupabaseUserRecord | null): UserProfile | null => {
  if (!data) return null;
  
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};