import React, { useState } from "react";
// Removed unused Link import
import { useLocation } from "wouter";
// Removed unused useAuth import
// import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  // Removed unused CardFooter import
  // CardFooter,
} from "@/components/ui/card";
// Removed unused Form imports
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
// } from "@/components/ui/form";
// Removed unused Input import
// import { Input } from "@/components/ui/input";
import { Github, Chrome } from "lucide-react"; // Keep Chrome for Google icon
import { useToast } from "@/hooks/use-toast";
// Removed unused signInWithRedirect import
import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation(); // Use navigate for redirection

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Login Successful", description: "Redirecting..." });
      navigate("/"); // Redirect to dashboard on success
    } catch (error) {
      console.error("Google Login Error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoadingGithub(true);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Login Successful", description: "Redirecting..." });
      navigate("/"); // Redirect to dashboard on success
    } catch (error) {
      console.error("GitHub Login Error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Could not sign in with GitHub.",
        variant: "destructive",
      });
    } finally {
      setLoadingGithub(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in using your preferred provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle || loadingGithub}
          >
            {loadingGoogle ? (
              "Signing in..."
            ) : (
              <>
                <Chrome className="mr-2 h-4 w-4" /> Google
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGithubLogin}
            disabled={loadingGoogle || loadingGithub}
          >
            {loadingGithub ? (
              "Signing in..."
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" /> GitHub
              </>
            )}
          </Button>
        </CardContent>
        {/* Removed CardFooter as it's empty */}
      </Card>
    </div>
  );
}
