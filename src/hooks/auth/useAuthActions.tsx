
import { NavigateFunction } from 'react-router-dom';
import { supabase, isOnline, checkSupabaseConnection } from '@/integrations/supabase/client';
import { showToast } from '@/components/ui/use-toast';
import { cleanupAuthState } from '@/services/api/userService/authUtils';
import { validateLoginInputs, validateSignupInputs, checkConnectionAndSupabase } from './authUtils';

interface AuthActionsProps {
  email: string;
  password: string;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  setAuthChecked: (checked: boolean) => void;
}

export const useAuthActions = ({
  email,
  password,
  setIsLoading,
  setErrorMessage,
  setAuthChecked
}: AuthActionsProps) => {
  
  const checkSession = async (navigate: NavigateFunction) => {
    try {
      console.log("Checking session on login page...");
      
      // Check network status first
      if (!isOnline()) {
        setAuthChecked(true);
        return;
      }
      
      // Check Supabase connection before attempting to get session
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        console.error("Cannot connect to Supabase");
        setErrorMessage("Cannot connect to authentication service. Please check your internet connection.");
        setAuthChecked(true);
        return;
      }
      
      // Get session
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        setErrorMessage("Error checking authentication status: " + error.message);
        setAuthChecked(true);
        return;
      }
      
      if (data.session) {
        console.log("Active session found, redirecting to home");
        navigate('/');
      }
    } catch (error: any) {
      console.error("Error checking session:", error);
      setErrorMessage("Session check failed: " + (error.message || "Unknown error"));
    } finally {
      setAuthChecked(true);
    }
  };
  
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
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Pre-signout failed, continuing with login", err);
      }
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      showToast.success("Login successful", "You have been logged in successfully.");
      
      console.log("Login successful, redirecting to homepage");
      
      // Force a page reload for clean state
      window.location.href = '/';
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle network errors specially
      if (!navigator.onLine || error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
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
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const validationError = validateSignupInputs(email, password);
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
      console.log("Attempting signup for:", email);
      
      // Clean up existing state
      cleanupAuthState();
      
      // Try to sign out first to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Pre-signout failed, continuing with signup", err);
      }
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      showToast.success("Sign up successful", "Your account has been created successfully. Please check your email for verification.");
      
      if (data.session) {
        console.log("Auto-confirmed signup, redirecting to homepage");
        // If auto-confirmed, redirect to home
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Handle specific errors
      if (!navigator.onLine || error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
        setErrorMessage("Network connection problem. Please check your internet connection and try again.");
      } else if (error.message?.includes('already registered')) {
        setErrorMessage("This email is already registered. Please try logging in instead.");
      } else {
        setErrorMessage(error.message || "An error occurred during sign up. Please try again.");
      }
      
      showToast.error("Sign up failed", error.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    checkSession,
    handleLogin,
    handleSignUp
  };
};
