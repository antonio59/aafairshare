import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../api/supabase';
import { createLogger } from '../utils/logger';
import { checkSupabaseConnection } from '../utils/connection';
import {
  SupabaseUser,
  UserProfile,
  AuthContextType,
  AuthResponse
} from '../types/users/index';

const logger = createLogger('AuthContext');
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const handleAuthError = useCallback((error: any): string => {
    if (error?.__isAuthError) {
      switch (error.status) {
        case 401:
          return 'Invalid email or password. Please check your credentials and try again.';
        case 400:
          return 'Invalid credentials format. Please ensure your email and password are correct.';
        case 422:
          return 'Email or password is too weak. Please use a stronger password.';
        case 429:
          return 'Too many login attempts. Please wait a moment and try again.';
        case 403:
          return 'Account is locked. Please contact support for assistance.';
        case 404:
          return 'Account not found. Please check your email or sign up for a new account.';
        default:
          return `Authentication failed (${error.status}). Please try again later.`;
      }
    }
    return error?.message || 'An unexpected error occurred. Please try again later.';
  }, []);

  const createUserProfile = useCallback(async (userId: string, email: string, name: string): Promise<UserProfile | null> => {
    try {
      const newProfile = {
        id: userId,
        email,
        name: name || email.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        logger.error('Error creating user profile:', error);
        setAuthError('Failed to create user profile');
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Exception creating user profile:', error);
      setAuthError('Failed to create user profile');
      return null;
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', error);
        setAuthError('Failed to fetch user profile');
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Exception fetching user profile:', error);
      setAuthError('Failed to fetch user profile');
      return null;
    }
  }, []);

  const getSession = useCallback(async () => {
    try {
      // First, try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session?.user || sessionError) {
        // Clear state immediately if no valid session
        setUser(null);
        setProfile(null);
        setAuthError('Session expired. Please sign in again.');
        logger.error('No valid session found:', sessionError || 'No session data');
        setLoading(false);
        return;
      }
      
      // If we have a valid session, set user and fetch profile
      logger.info('Valid session found');
      setUser(session.user);
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        setProfile(profile);
        setAuthError(null);
      }
    } catch (error) {
      logger.error('Session initialization error:', error);
      setUser(null);
      setProfile(null);
      setAuthError(handleAuthError(error));
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile, handleAuthError]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    clearError();
    try {
      // Check connection before attempting sign in
      const connectionStatus = await checkSupabaseConnection();
      if (!connectionStatus.success) {
        logger.error('Supabase connection check failed:', connectionStatus.error);
        throw new Error('Unable to connect to authentication service');
      }

      logger.info('Attempting sign in for:', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign-in error details:', {
          status: error.status,
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        throw error;
      }

      logger.info('Sign in successful');
      setUser(data.user);
      const profile = await fetchUserProfile(data.user.id);
      if (profile) {
        setProfile(profile);
        // Let the component handle navigation
        return { success: true, message: 'Successfully signed in' };
      }

      return { success: true, message: 'Successfully signed in' };
    } catch (error) {
      logger.error('Sign-in error:', error);
      const errorMessage = handleAuthError(error);
      setAuthError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [fetchUserProfile, handleAuthError, clearError]);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<AuthResponse> => {
    clearError();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        const profile = await createUserProfile(data.user.id, email, name);
        if (profile) {
          setProfile(profile);
          return { success: true, message: 'Account created successfully' };
        }
      }

      return { success: false, message: 'Failed to create account' };
    } catch (error) {
      logger.error('Sign-up error:', error);
      const errorMessage = handleAuthError(error);
      setAuthError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [createUserProfile, handleAuthError, clearError]);

  const signOut = useCallback(async () => {
    clearError();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      return { success: true, message: 'Successfully signed out' };
    } catch (error) {
      logger.error('Sign-out error:', error);
      const errorMessage = handleAuthError(error);
      setAuthError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [handleAuthError, clearError]);

  useEffect(() => {
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setProfile(profile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getSession, fetchUserProfile]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we already have a valid session before attempting refresh
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session?.user) {
        logger.info('Found valid current session');
        return true;
      }

      logger.info('No valid session found, attempting refresh...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        // Handle AuthSessionMissingError gracefully
        if (error.name === 'AuthSessionMissingError') {
          logger.info('No session to refresh');
          setUser(null);
          setProfile(null);
          return false;
        }
        
        // Handle other errors
        logger.error('Session refresh failed:', error);
        setUser(null);
        setProfile(null);
        setAuthError('Session expired. Please sign in again.');
        return false;
      }
      
      if (!session) {
        logger.error('Session refresh failed: No session data');
        setUser(null);
        setProfile(null);
        setAuthError('Session expired. Please sign in again.');
        return false;
      }
      
      // If refresh succeeds, update state
      logger.info('Session refresh successful');
      setUser(session.user);
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        setProfile(profile);
        setAuthError(null);
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = handleAuthError(error);
      logger.error('Session refresh error:', { error: errorMessage });
      setAuthError(errorMessage);
      return false;
    }
  }, [fetchUserProfile, handleAuthError]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      if (!user?.id) return null;

      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating profile:', error);
        setAuthError('Failed to update profile');
        return null;
      }

      setProfile(updatedProfile as UserProfile);
      return updatedProfile as UserProfile;
    } catch (error) {
      logger.error('Exception updating profile:', error);
      setAuthError('Failed to update profile');
      return null;
    }
  }, [user]);

  const resetAuthState = useCallback(async (): Promise<boolean> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setAuthError(null);
      setLoading(false);
      return true;
    } catch (error) {
      logger.error('Error resetting auth state:', error);
      return false;
    }
  }, []);

  const value = {
    user,
    profile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    clearError,
    refreshSession,
    updateProfile,
    fetchUserProfile,
    resetAuthState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}