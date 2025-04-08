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
// Removed Chrome icon import
import { useToast } from "@/hooks/use-toast";
// Reverting back to signInWithPopup
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext"; // Import useAuth


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
     return null; // Or <Redirect to="/" />
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

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} AAFairShare. All rights reserved.
      </footer>
    </div>
  );
}
