
import React from 'react';
import { getSupabase, isOnline, checkSupabaseConnection, cleanupAuthState, forceSignOut } from '@/integrations/supabase/client';
import { showToast } from '@/components/ui/use-toast';
import { validateLoginInputs, checkConnectionAndSupabase } from './authUtils';

interface LoginHandlerProps {
  email: string;
  password: string;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
}

export const useLoginHandler = ({
  email,
  password,
  setIsLoading,
  setErrorMessage
}: LoginHandlerProps) => {
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const validationError = validateLoginInputs(email, password);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    // Check connection
    const connection = await checkConnectionAndSupabase();
    if (!connection.isConnected) {
      setErrorMessage(connection.error || "Connection error");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Attempting login for:", email);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Try to sign out first to ensure clean state
      await forceSignOut();
      
      // Get supabase client
      const supabase = await getSupabase();
      
      // Sign in with Supabase with modified approach
      console.log("Sending sign-in request to Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Log success and session details (no sensitive info)
      console.log("Login successful, session established:", !!data.session);
      
      showToast.success("Login successful!");
      
      // Force a page reload for clean state - more reliable than navigation
      console.log("Redirecting to homepage");
      window.location.href = '/';
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle network errors specially
      if (!navigator.onLine || error.message?.toLowerCase().includes('fetch') || error.code === 'NETWORK_ERROR') {
        setErrorMessage("Network connection problem. Please check your internet connection and try again.");
      } else if (error.message?.includes('Invalid login credentials')) { 
        setErrorMessage("Invalid email or password. Please try again.");
      } else {
        setErrorMessage(error.message || "An error occurred during login. Please try again.");
      }
      
      showToast.error("Login failed", error.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleLogin };
};
