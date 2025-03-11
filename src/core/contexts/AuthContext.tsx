import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../api/supabase';
import { _initializeUserSettings } from '../services/settingsService';
import { createLogger } from '../utils/logger';

// Create a logger for this module
const logger = createLogger('AuthContext');

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<{ success: boolean }>;
  fetchUserProfile: (userId: string) => Promise<any | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch user profile function
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('DEBUG: fetchUserProfile called for userId:', userId);
      
      // Get user data from users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log('DEBUG: User profile fetch result:', { data, error });
      
      if (data && !error) {
        console.log('DEBUG: Setting profile with data:', data);
        setProfile(data);
        return data;
      }
      
      // If no profile found, return null but don't throw an error
      console.log('DEBUG: No user profile found');
      return null;
    } catch (error) {
      console.log('DEBUG: Error in fetchUserProfile:', error);
      logger.error('Error fetching profile:', error);
      return null;
    }
  };

  // Create user profile function
  const createUserProfile = async (userId: string, email: string, name: string) => {
    try {
      console.log('DEBUG: createUserProfile called with:', { userId, email, name });
      
      // Create default preferences
      const preferences = { currency: 'GBP', notifications: true, theme: 'light' };
      
      // Insert the new user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email,
          name,
          preferences,
          language: 'en'
        }])
        .select()
        .single();
        
      console.log('DEBUG: Create user profile result:', { data, error });
      
      if (error) {
        console.log('DEBUG: Error creating user profile:', error);
        return null;
      }
      
      console.log('DEBUG: Setting profile with new data:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.log('DEBUG: Error in createUserProfile:', error);
      logger.error('User profile creation error', error);
      return null;
    }
  };

  // Effect to check session and set up auth listener
  useEffect(() => {
    console.log('DEBUG: AuthContext useEffect running');
    let isEffectActive = true;
    
    const getSession = async () => {
      try {
        console.log('DEBUG: Getting session');
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        console.log('DEBUG: getSession result:', { session: data?.session, error });
        
        if (error) {
          console.log('DEBUG: Error getting session:', error);
          if (isEffectActive) {
            setAuthError(error.message);
            setLoading(false);
          }
          return;
        }
        
        if (data?.session?.user) {
          console.log('DEBUG: Session has user, setting user');
          const user = data.session.user;
          if (isEffectActive) {
            setUser(user);
            
            // Get or create profile
            const profile = await fetchUserProfile(user.id);
            if (!profile) {
              console.log('DEBUG: No user profile found, creating one');
              const name = user.user_metadata?.name || '';
              await createUserProfile(user.id, user.email || '', name);
            }
          }
        } else {
          console.log('DEBUG: No session or user');
          if (isEffectActive) {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error: any) {
        console.log('DEBUG: Error in getSession:', error);
        if (isEffectActive) {
          setAuthError(error.message || 'An error occurred');
        }
      } finally {
        if (isEffectActive) {
          console.log('DEBUG: Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Initial session check
    getSession();

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('DEBUG: Auth state change event:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('DEBUG: Auth state change - signed in or token refreshed');
          setLoading(true);
          
          if (session?.user) {
            console.log('DEBUG: Auth state change - user exists');
            setUser(session.user);
            const profile = await fetchUserProfile(session.user.id);
            if (!profile && isEffectActive) {
              console.log('DEBUG: No user profile found, creating one');
              const name = session.user.user_metadata?.name || '';
              await createUserProfile(session.user.id, session.user.email || '', name);
            }
          }
          
          if (isEffectActive) {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('DEBUG: Auth state change - signed out');
          if (isEffectActive) {
            setUser(null);
            setProfile(null);
          }
        }
      }
    );

    // Clean up the subscription and effect flag when the component unmounts
    return () => {
      console.log('DEBUG: Cleaning up auth subscription');
      isEffectActive = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        logger.error('Error fetching profile:', error);
        setProfile(null);
      }
    };

    fetchProfile();
  }, [user]);

  // Simplified sign in
  const signIn = async (email: string, password: string) => {
    try {
      console.log('DEBUG: Sign in attempt for:', email);
      setAuthError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('DEBUG: Sign in result:', { user: data?.user, error });
      
      if (error) {
        console.log('DEBUG: Sign in error:', error);
        setAuthError('Failed to sign in. Please check your credentials.');
        throw error;
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      console.log('DEBUG: Error in signIn:', error);
      setAuthError(error.message || 'An error occurred during sign in');
      return { success: false, message: error.message || 'An error occurred during sign in' };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('DEBUG: Sign up attempt for:', email);
      setAuthError(null);
      
      // Create the new auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      console.log('DEBUG: Sign up result:', { user: data?.user, error });
      
      if (error) {
        console.log('DEBUG: Sign up error:', error);
        setAuthError(error.message || 'Failed to sign up');
        return { success: false, message: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.log('DEBUG: Error in signUp:', error);
      setAuthError(error.message || 'An error occurred during sign up');
      return { success: false, message: error.message || 'An error occurred during sign up' };
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      console.log('DEBUG: Sign out attempt');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log('DEBUG: Sign out error:', error);
        throw error;
      }
      
      console.log('DEBUG: Sign out successful');
      setUser(null);
      setProfile(null);
      
      return { success: true };
    } catch (error: any) {
      console.log('DEBUG: Error in signOut:', error);
      setAuthError(error.message || 'An error occurred during sign out');
      return { success: false };
    }
  };
  
  // Clear any auth errors
  const clearError = () => {
    setAuthError(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    fetchUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}