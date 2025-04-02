import React, { useState, useEffect } from "react"; // Import useEffect
import { Redirect, useLocation } from "wouter"; // Import Redirect and useLocation
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Reverting back to signInWithPopup
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

// Simple Logo Component (Replace with actual SVG or Image if available)
const AppLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-12 w-12 text-primary mx-auto" // Increased size and used primary color
  >
    {/* Simple abstract shape representing sharing/fairness */}
    <path d="M12 2 L18 7 L18 17 L12 22 L6 17 L6 7 Z" />
    <path d="M6 7 L12 12 L18 7" />
    <path d="M12 12 L12 22" />
  </svg>
);


export default function Login() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth(); // Get auth state
  const [, navigate] = useLocation(); // Keep navigate for potential future use or consistency

  // --- Redirect if already logged in ---
  useEffect(() => {
    // Only redirect if auth is not loading and user exists
    if (!authLoading && currentUser) {
      console.log("Login Page: User already authenticated, redirecting to /");
      navigate("/", { replace: true }); // Use navigate for redirection
    }
  }, [authLoading, currentUser, navigate]);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const provider = new GoogleAuthProvider();
      // Use signInWithPopup
      await signInWithPopup(auth, provider);
      // Auth state change will be handled by AuthContext listener
      // Toast for success can be shown here or handled globally if preferred
      toast({ title: "Login Successful", description: "Checking authentication..." });
      // Redirect is handled by the useEffect hook checking currentUser
    } catch (error) {
      console.error("Google Popup Login Error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Could not sign in with Google.",
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
     return null; // Or <Redirect to="/" />
  }

  // If not loading and no user, show the login form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      {/* Branding Area */}
      <div className="mb-8 text-center space-y-4">
         <AppLogo /> {/* Using the SVG Logo component */}
         <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
           AAFairShare
         </h1>
         <p className="text-muted-foreground">Split expenses fairly and easily.</p>
      </div>

      {/* Login Card - Adjusted width and added subtle shadow */}
      <Card className="w-full max-w-md shadow-lg dark:bg-gray-850"> {/* Increased max-width */}
        <CardHeader className="text-center"> {/* Centered Header Text */}
          <CardTitle className="text-2xl font-semibold">Welcome Back!</CardTitle>
          <CardDescription>
            Sign in with your Google account to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 p-6"> {/* Increased gap and padding */}
          <Button
            variant="outline"
            size="lg" // Larger button size
            className="w-full flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700" // Added hover effect
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <Chrome className="h-5 w-5" /> {/* Slightly larger icon */}
                <span>Sign in with Google</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Optional Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} AAFairShare. All rights reserved.
      </footer>
    </div>
  );
}
