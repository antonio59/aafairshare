
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast, showToast } from '@/components/ui/use-toast';
import { supabase, isOnline, checkSupabaseConnection } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
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

  // If connection is being checked or auth status is unknown
  if (!authChecked || connectionStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">AAFairShare</h1>
          <p className="text-gray-600">Track and split expenses fairly</p>
        </div>

        {connectionStatus === 'offline' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Sign in to access your shared expenses</CardDescription>
              </div>
              <div className="text-sm flex items-center gap-1 text-gray-500">
                {connectionStatus === 'online' ? (
                  <>
                    <Wifi className="h-4 w-4" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <button type="button" className="text-sm text-blue-600 hover:underline">
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || connectionStatus === 'offline'}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : 'Login'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading || connectionStatus === 'offline'}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : 'Create account'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-gray-600">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
