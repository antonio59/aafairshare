import { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { useAuth } from '~/contexts/AuthContext';
import firebase from 'firebase/compat/app';

export default function Login() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const { toast } = useToast();
  const { currentUser, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- Redirect if already logged in ---
  useEffect(() => {
    // Only redirect if auth is not loading and user exists
    if (!authLoading && currentUser) {
      console.log("Login Page: User already authenticated, redirecting to /");
      navigate("/");
    }
  }, [authLoading, currentUser, navigate]);

  // Direct Firebase login function that doesn't rely on AuthContext
  const directFirebaseLogin = async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot login on server-side');
      }

      console.log('Attempting direct Firebase login');

      // Try to use the global firebase object first
      if (window.firebase && typeof window.firebase.auth === 'function') {
        console.log('Using global firebase object');
        const auth = window.firebase.auth();
        const provider = new window.firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        console.log('Sign in successful with global firebase');
        return true;
      }

      // If global firebase is not available, try to load it dynamically
      console.log('Global firebase not available, trying to load dynamically');

      // Check if Firebase SDK is loaded
      if (!window.firebase) {
        console.log('Firebase SDK not loaded, loading scripts');

        // Create a promise to load Firebase scripts
        const loadFirebaseScripts = new Promise<void>((resolve, reject) => {
          // Load Firebase App
          const appScript = document.createElement('script');
          appScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
          appScript.onload = () => {
            // Load Firebase Auth
            const authScript = document.createElement('script');
            authScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js';
            authScript.onload = () => resolve();
            authScript.onerror = (e) => reject(new Error('Failed to load Firebase Auth script'));
            document.head.appendChild(authScript);
          };
          appScript.onerror = (e) => reject(new Error('Failed to load Firebase App script'));
          document.head.appendChild(appScript);
        });

        // Wait for scripts to load
        await loadFirebaseScripts;

        // Initialize Firebase
        if (window.firebase) {
          const firebaseConfig = {
            apiKey: "AIzaSyAYLQoJRCZ9ynyASEQ0zNWez9GUeNG4qsg",
            authDomain: "aafairshare-37271.firebaseapp.com",
            projectId: "aafairshare-37271",
            storageBucket: "aafairshare-37271.appspot.com",
            messagingSenderId: "121020031141",
            appId: "1:121020031141:web:c56c04b654aae5cfd76d4c"
          };

          window.firebase.initializeApp(firebaseConfig);
        } else {
          throw new Error('Failed to load Firebase SDK');
        }
      }

      // Now try to use Firebase
      if (window.firebase && typeof window.firebase.auth === 'function') {
        const auth = window.firebase.auth();
        const provider = new window.firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        console.log('Sign in successful after loading Firebase');
        return true;
      }

      throw new Error('Firebase authentication is not available');
    } catch (error) {
      console.error('Direct Firebase login error:', error);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      console.log('Login page: Starting Google sign-in process');

      // Skip AuthContext method and go straight to direct method
      // This is more reliable in SSR environments like Remix
      try {
        const success = await directFirebaseLogin();
        if (success) {
          toast({ title: "Login Successful", description: "Checking authentication..." });

          // Manually reload the page to ensure auth state is updated
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      } catch (directError) {
        console.error('Direct login failed:', directError);
        throw directError;
      }
    } catch (error) {
      console.error("Google Popup Login Error:", error);

      // More detailed error message
      let errorMessage = "Could not sign in with Google.";
      if (error instanceof Error) {
        errorMessage = error.message;

        // Special handling for common Firebase auth errors
        if (errorMessage.includes('auth.signInWithPopup')) {
          errorMessage = "Authentication method not available. Please refresh the page and try again.";
        } else if (errorMessage.includes('popup closed')) {
          errorMessage = "Sign-in popup was closed. Please try again.";
        } else if (errorMessage.includes('network')) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (errorMessage.includes('Firebase')) {
          errorMessage = "Firebase error: " + errorMessage;
        }
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingGoogle(false); // Ensure loading state is reset
    }
  };

  // --- Render Loading or Login Form ---
  // Show loading indicator while auth state is being determined
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Checking Status...</h2>
        </div>
      </div>
    );
  }

  // If not loading and user exists, redirect is handled by useEffect,
  // but rendering null briefly prevents flicker. Could also return Redirect here.
  if (currentUser) {
     return null;
  }

  // If not loading and no user, show the login form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      {/* Branding Area */}
      <div className="mb-10 text-center space-y-3">
         <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
           AAFairShare
         </h1>
         <p className="text-muted-foreground text-lg">Split expenses fairly and easily.</p>
      </div>

      {/* Login Card - Refined design */}
      <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in with your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center py-6 text-base font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in with Google</span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* No test components in production */}

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} AAFairShare. All rights reserved.
      </footer>
    </div>
  );
}
