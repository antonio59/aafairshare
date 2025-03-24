'use client';

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  type ReactNode 
} from 'react';

import type { Session, User } from '@supabase/supabase-js';

import { createStandardBrowserClient } from '@/utils/supabase-client';

// Define the shape of our auth context
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null } | null;
  }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null, data: null }),
  signOut: async () => {},
  refreshSession: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize Supabase client
  const supabase = createStandardBrowserClient();

  // Function to sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error, data: { user: data?.user || null } };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        error: error instanceof Error ? error : new Error('Unknown error occurred'), 
        data: null 
      };
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user || null);
    } catch (error) {
      console.error('Session refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to auth changes on component mount
  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } | null } = { subscription: null };
    
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        
        // Get the initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user || null);
          }
        );
        
        authListener.subscription = subscription;
        
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUser();
    
    // Return cleanup function
    return () => {
      if (authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}