'use client';

import { AlertCircle, EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createStandardBrowserClient } from '@/utils/supabase-client';


export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  
  const router = useRouter();
  const { toast } = useToast();
  
  const supabase = createStandardBrowserClient();

  // Extract redirect URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectParam = searchParams.get('redirect');
    
    if (redirectParam) {
      try {
        // Handle double-encoded URLs
        const decodedOnce = decodeURIComponent(redirectParam);
        
        // Check if it's double-encoded (starts with %2F)
        if (decodedOnce.startsWith('%2F')) {
          const fullyDecoded = decodeURIComponent(decodedOnce);
          setRedirectPath(fullyDecoded);
        } else {
          setRedirectPath(decodedOnce);
        }
        
        console.log('Redirect path set to:', redirectParam, '→', decodedOnce);
      } catch (e) {
        console.error('Error decoding redirect URL:', e);
        setRedirectPath('/dashboard');
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const [authError, setAuthError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setAuthError('Email and password are required');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Successful login
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in',
          variant: 'default',
        });
        
        // Navigate to the previously determined redirect path
        console.log('Redirecting to:', redirectPath);
        
        // Brief delay to ensure toast is shown
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 300);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific error types for better user feedback
      if (error.message?.includes('Invalid login')) {
        setAuthError('Invalid email or password');
      } else if (error.message?.includes('Email not confirmed')) {
        setAuthError('Please confirm your email address');
      } else {
        setAuthError(error.message || 'Authentication failed. Please try again.');
      }
      
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  }

  return (
    <div className="space-y-6">
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="name@example.com"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            required
            disabled={isLoading}
            className="w-full h-11 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="w-full h-11 pr-10 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? 
                <EyeOffIcon className="h-4 w-4" /> : 
                <EyeIcon className="h-4 w-4" />
              }
            </button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
}