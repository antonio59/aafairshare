'use client';

import * as React from 'react';
import { LogOut, ChevronDown, User, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card } from './card';
import { toast } from './use-toast';
import { cn } from '@/lib/utils';

interface UserSelectProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  onResetPassword?: (email: string) => Promise<void>;
  className?: string;
}

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type AuthFormData = z.infer<typeof authSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export function UserSelect({
  user,
  onLogin,
  onLogout,
  onResetPassword,
  className,
}: UserSelectProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResetMode, setIsResetMode] = React.useState(false);

  const {
    register: registerAuth,
    handleSubmit: handleAuthSubmit,
    formState: { errors: authErrors },
    reset: resetAuthForm,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetResetForm,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const handleLogin = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      await onLogin(data.email, data.password);
      resetAuthForm();
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    if (!onResetPassword) return;
    
    setIsLoading(true);
    try {
      await onResetPassword(data.email);
      resetResetForm();
      setIsResetMode(false);
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for further instructions.',
      });
    } catch (error) {
      toast({
        title: 'Password reset failed',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await onLogout();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'flex items-center gap-2 h-10 px-3 py-2',
              className
            )}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="max-w-[100px] truncate">{user.name}</span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoading}
            className="text-red-600 focus:text-red-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {isResetMode ? 'Reset Password' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {isResetMode
            ? 'Enter your email to reset your password'
            : 'Sign in to manage your expenses'}
        </p>
      </div>

      {isResetMode ? (
        <form onSubmit={handleResetSubmit(handleResetPassword)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                {...registerReset('email')}
              />
            </div>
            {resetErrors.email && (
              <p className="text-sm text-red-500">{resetErrors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Send Reset Link
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsResetMode(false)}
            disabled={isLoading}
          >
            Back to Login
          </Button>
        </form>
      ) : (
        <form onSubmit={handleAuthSubmit(handleLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                {...registerAuth('email')}
              />
            </div>
            {authErrors.email && (
              <p className="text-sm text-red-500">{authErrors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...registerAuth('password')}
              />
            </div>
            {authErrors.password && (
              <p className="text-sm text-red-500">{authErrors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Sign In
          </Button>

          {onResetPassword && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsResetMode(true)}
              disabled={isLoading}
            >
              Forgot Password?
            </Button>
          )}
        </form>
      )}
    </Card>
  );
}
