import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { Button } from "@/components/ui/button";
import { LockKeyhole, User } from "lucide-react";

// Form schema for validation
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Define auth response type
  interface AuthStatusResponse {
    isAuthenticated: boolean;
    user?: {
      id: number;
      username: string;
    };
  }

  // Check if user is already authenticated
  const { data: authData, isLoading: isCheckingAuth } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: false,
  });

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (authData && authData.isAuthenticated) {
      setLocation('/');
    }
  }, [authData, setLocation]);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Use the apiRequest function which already handles error checking
      await apiRequest('POST', '/api/auth/login', data);
      
      // Invalidate auth status cache so it will refetch and show as logged in
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });
      
      // Use wouter's setLocation for smoother navigation instead of window.location
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">AAFairShare</CardTitle>
          <CardDescription className="text-center">
            Log in to manage your shared expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          className="pl-10"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LockKeyhole className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          className="pl-10"
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
              <Button type="submit" className="w-full" disabled={isLoading || isCheckingAuth}>
                {isLoading ? "Logging in..." : isCheckingAuth ? "Checking..." : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        {/* Register button removed as per requirement */}
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}