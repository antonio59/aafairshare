
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isOnline, checkSupabaseConnection } from "@/integrations/supabase/client";
import { showToast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session on login page...");
        
        // Check network status first
        if (!isOnline()) {
          setConnectionStatus('offline');
          setAuthChecked(true);
          return;
        }
        
        // Check Supabase connection before attempting to get session
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          console.error("Cannot connect to Supabase");
          setConnectionStatus('offline');
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
        setConnectionStatus('online');
        setAuthChecked(true);
      }
    };
    
    checkSession();
    
    // Add network status listeners
    const handleOnline = () => {
      setConnectionStatus('online');
      setErrorMessage(null); // Clear error messages when going online
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
      setErrorMessage("You are offline. Please check your internet connection.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const cleanupAuthState = () => {
    console.log("Cleaning up auth state");
    // Flag for detecting auth errors
    localStorage.removeItem('auth-error-detected');
    
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
        console.log("Removing localStorage key:", key);
        localStorage.removeItem(key);
      }
    });
    
    // Do the same for sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
        console.log("Removing sessionStorage key:", key);
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }
    
    if (!password.trim()) {
      setErrorMessage("Password is required");
      return;
    }
    
    // Check if we're online
    if (!isOnline()) {
      setErrorMessage("You appear to be offline. Please check your internet connection and try again.");
      return;
    }
    
    // Check Supabase connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      setErrorMessage("Cannot connect to authentication service. Please check your internet connection.");
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
      
      // Force a page refresh for clean state
      window.location.href = '/';
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Increment login attempts
      const newAttemptCount = loginAttempts + 1;
      setLoginAttempts(newAttemptCount);
      
      // Handle network errors specially
      if (error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
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
    if (!email.trim()) {
      setErrorMessage("Email is required");
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    
    // Check if we're online
    if (!isOnline()) {
      setErrorMessage("You appear to be offline. Please check your internet connection and try again.");
      return;
    }
    
    // Check Supabase connection
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      setErrorMessage("Cannot connect to authentication service. Please check your internet connection.");
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
      if (error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
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
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    authChecked,
    connectionStatus,
    errorMessage,
    handleLogin,
    handleSignUp
  };
};
