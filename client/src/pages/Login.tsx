
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

  // Streamlined login function to avoid page refresh
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }
      
      // Refresh auth state
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      toast({
        title: "Success",
        description: "Login successful!",
      });
      
      // Use React Router navigation instead of page reload
      setLocation('/');
    } 
    catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } 
    finally {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4 login-screen-mobile">
      <div className="w-full max-w-md flex flex-col">
        {/* Reduced top margin for the app title/logo */}
        <div className="mb-3 text-center login-header">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
            <span className="text-primary">AA</span>FairShare
          </h1>
          <p className="text-gray-500 text-sm">Track, split, and settle expenses effortlessly</p>
        </div>
        
        <Card className="border shadow-md login-card">
          <CardHeader className="pb-0 pt-3">
            <CardTitle className="text-xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-xs">
              Sign in to continue managing shared expenses
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2 px-4 pb-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1 form-field">
                      <FormLabel className="text-xs font-medium">Email</FormLabel>
                      <FormControl>
                        <div className="relative login-input-animated">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <Input
                            className="pl-10 h-10 bg-gray-50/50 transition-all"
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            disabled={isLoading || isCheckingAuth}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1 form-field">
                      <FormLabel className="text-xs font-medium">Password</FormLabel>
                      <FormControl>
                        <div className="relative login-input-animated">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockKeyhole className="h-4 w-4 text-gray-400" />
                          </div>
                          <Input
                            className="pl-10 h-10 bg-gray-50/50 transition-all"
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                            disabled={isLoading || isCheckingAuth}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold mt-1 transition-all hover:brightness-105 active:scale-[0.98]" 
                  disabled={isLoading || isCheckingAuth}
                >
                  {isLoading ? "Signing in..." : isCheckingAuth ? "Checking..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="pt-0 pb-3 flex justify-center">
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-xs text-gray-500 hover:text-primary h-8">
                  <KeyRound className="h-3 w-3 mr-1" />
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
        {/* Registration link removed */}
      </div>
    </div>
  );
}
