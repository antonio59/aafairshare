
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LockKeyhole, Mail, CreditCard, PoundSterling, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  interface AuthStatusResponse {
    isAuthenticated: boolean;
    user?: {
      id: number;
      username: string;
    };
  }

  const { data: authData, isLoading: isCheckingAuth } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: false,
  });

  useEffect(() => {
    if (authData && authData.isAuthenticated) {
      setLocation('/');
    }
  }, [authData, setLocation]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  // UPDATED EMERGENCY DIRECT LOGIN FUNCTION
  // This completely bypasses the normal React Query flow to help debug session issues
  // Using simple XMLHttpRequest for maximum compatibility
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Clear any existing console
      console.clear();
      console.log("%c=== EMERGENCY DIRECT LOGIN ATTEMPT ===", "color:red; font-size:16px; font-weight:bold");
      console.log("Attempting login with:", { email: data.email });

      console.log("STEP 1: Check cookies before login");
      console.log(`Current document.cookie (length only for security): ${document.cookie.length}`);
      
      // Using XMLHttpRequest for Login - most basic browser API
      console.log("STEP 2: Send login request via XMLHttpRequest");
      
      const loginPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/auth/login", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.withCredentials = true;
        
        xhr.onload = function() {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log(`Login request succeeded with status ${xhr.status}`);
              console.log(`Response headers: ${xhr.getAllResponseHeaders()}`);
              
              const response = JSON.parse(xhr.responseText);
              console.log("Login response data:", response);
              resolve(response);
            } else {
              console.error(`Login failed with status ${xhr.status}`);
              reject(new Error(`Login failed with status ${xhr.status}: ${xhr.responseText}`));
            }
          } catch (error) {
            reject(error);
          }
        };
        
        xhr.onerror = function() {
          console.error("Network error during login");
          reject(new Error("Network error during login"));
        };
        
        const requestBody = JSON.stringify(data);
        console.log(`Sending request with body: ${requestBody}`);
        xhr.send(requestBody);
      });
      
      await loginPromise;
      
      console.log("STEP 3: Check cookies after login");
      console.log(`document.cookie after login (length only): ${document.cookie.length}`);
      
      // Force delay to ensure cookie is set
      console.log("Waiting 1 second before checking auth status...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("STEP 4: Verify auth status with XMLHttpRequest");
      const verifyPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/auth/status", true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.withCredentials = true;
        
        xhr.onload = function() {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log(`Auth status request succeeded with status ${xhr.status}`);
              const response = JSON.parse(xhr.responseText);
              console.log("Auth status response:", response);
              resolve(response);
            } else {
              console.error(`Auth status check failed with status ${xhr.status}`);
              reject(new Error(`Auth check failed: ${xhr.responseText}`));
            }
          } catch (error) {
            reject(error);
          }
        };
        
        xhr.onerror = function() {
          console.error("Network error during auth check");
          reject(new Error("Network error during auth check"));
        };
        
        xhr.send();
      });
      
      const authStatus = await verifyPromise;
      
      if (authStatus.isAuthenticated) {
        console.log("%c=== LOGIN SUCCESSFUL ===", "color:green; font-size:16px; font-weight:bold");
        console.log(`Logged in as: ${authStatus.user?.username} (ID: ${authStatus.user?.id})`);
        
        toast({
          title: "Success",
          description: "Login successful! Redirecting to dashboard...",
        });
        
        console.log("STEP 5: Redirect to dashboard");
        // Force full page reload to dashboard
        window.location.href = '/';
      } else {
        console.error("%c=== AUTH VERIFICATION FAILED ===", "color:red; font-size:16px; font-weight:bold");
        console.log("Login succeeded but session verification failed!");
        
        toast({
          title: "Authentication Error",
          description: "Login succeeded but session wasn't established. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("%c=== LOGIN FAILED ===", "color:red; font-size:16px; font-weight:bold");
      console.error("Login error:", error);
      
      toast({
        title: "Login Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (data: ResetPasswordData) => {
    setIsResettingPassword(true);
    try {
      await apiRequest('/api/auth/reset-password', 'POST', {
        email: data.email,
        newPassword: data.newPassword
      });

      // Also invalidate auth status after password reset
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });

      toast({
        title: "Success",
        description: "Password has been reset. You can now login with your new password.",
      });
      
      // Close the dialog and reset form values
      setResetDialogOpen(false);
      resetPasswordForm.reset();
      
      // Update login form with email so user can login right away
      form.setValue("email", data.email);
      form.setValue("password", "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Password reset failed",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <PoundSterling className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">AAFairShare</h1>
          <p className="text-gray-500 text-lg">Track, split, and settle expenses effortlessly</p>
        </div>
        
        <Card className="border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to continue managing shared expenses
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="space-y-2 mb-4">
              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <strong>Login issues?</strong> Try using this direct form instead:
                </p>
              </div>
              {/* DIRECT SERVER FORM - bypasses all client-side processing */}
              <form 
                method="POST" 
                action="/api/auth/login" 
                className="space-y-5 border border-green-100 p-4 rounded-md bg-green-50"
              >
                <div className="space-y-2">
                  <label htmlFor="direct-email" className="text-sm font-medium block">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="direct-email"
                      name="email"
                      className="pl-10 h-11 bg-white border border-gray-200 rounded-md w-full px-3 py-2"
                      type="email"
                      placeholder="Enter your email"
                      defaultValue="antoniojsmith@protonmail.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="direct-password" className="text-sm font-medium block">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockKeyhole className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="direct-password"
                      name="password"
                      className="pl-10 h-11 bg-white border border-gray-200 rounded-md w-full px-3 py-2"
                      type="password"
                      placeholder="Enter your password"
                      defaultValue="Password123"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold mt-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Direct Server Login
                </button>
                <p className="text-xs text-center text-green-700">This form bypasses client-side JavaScript</p>
              </form>
            </div>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-500">OR USE STANDARD LOGIN</span>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            className="pl-10 h-11 bg-gray-50/50"
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            disabled={isLoading || isCheckingAuth}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockKeyhole className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            className="pl-10 h-11 bg-gray-50/50"
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                            disabled={isLoading || isCheckingAuth}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold mt-2" 
                  disabled={isLoading || isCheckingAuth}
                >
                  {isLoading ? "Signing in..." : isCheckingAuth ? "Checking..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="pb-6 flex justify-center">
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm text-gray-500 hover:text-primary">
                  <KeyRound className="h-4 w-4 mr-1" />
                  Forgot password?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email and new password to reset your account password.
                  </DialogDescription>
                </DialogHeader>
                <Form {...resetPasswordForm}>
                  <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <FormField
                      control={resetPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetPasswordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={resetPasswordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isResettingPassword}>
                        {isResettingPassword ? "Resetting..." : "Reset Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex space-x-2 justify-center">
            <CreditCard className="h-4 w-4" />
            <span>Securely manage shared finances with ease</span>
          </div>
        </div>
      </div>
    </div>
  );
}
