import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { supabase } from '../../../core/api/supabase';

interface AuthPageProps {
  mode?: 'login' | 'signup';
}

export default function AuthPage({ mode = 'login' }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | string>(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [loadingMessage, setLoadingMessage] = useState('');
  const { signIn, signUp, user, profile, resetAuthState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Update isSignUp when mode prop changes
  useEffect(() => {
    setIsSignUp(mode === 'signup');
  }, [mode]);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth state check for redirect:', { 
      hasUser: !!user, 
      hasProfile: !!profile,
      pathname: location.pathname
    });
    
    if (user) {
      // Only redirect if we're not already on an auth page
      const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
      const redirectTo = location.state?.from?.pathname || '/';
      
      console.log('Authentication status check:', {
        isLoggedIn: true,
        currentPath: location.pathname,
        isAuthPage,
        wouldRedirectTo: redirectTo
      });
      
      // Don't redirect if we're intentionally on an auth page (for testing, etc.)
      // This prevents redirection loops
      if (!isAuthPage) {
        // Use a small timeout to allow other state updates to complete
        const redirectTimer = setTimeout(() => {
          console.log('Executing redirect now to:', redirectTo);
          navigate(redirectTo, { replace: true });
        }, 300);
        
        return () => clearTimeout(redirectTimer);
      } else {
        console.log('On auth page while logged in - not redirecting');
      }
    } else {
      console.log('User not authenticated, staying on auth page');
    }
  }, [user, profile, navigate, location]);

  // Show helpful messages if loading takes a while
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (loading) {
      // After 3 seconds of loading, show a message
      timeoutId = setTimeout(() => {
        setLoadingMessage('This is taking longer than expected...');
      }, 3000);
      
      // After 10 seconds, show a more detailed message
      const longTimeoutId = setTimeout(() => {
        setLoadingMessage('Still working... You can try refreshing the page if this continues.');
      }, 10000);
      
      // After 15 seconds, offer a reset button option
      const resetTimeoutId = setTimeout(() => {
        setLoadingMessage('Having trouble? Click the Reset button below to try again.');
      }, 15000);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(longTimeoutId);
        clearTimeout(resetTimeoutId);
      };
    } else {
      setLoadingMessage('');
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      // Check for empty fields first
      if (!email) {
        throw new Error('Email is required');
      }
      
      if (!password) {
        throw new Error('Password is required');
      }
      
      if (isSignUp && !name) {
        throw new Error('Full name is required');
      }

      console.log('Attempting authentication', { isSignUp, email });
      let result;
      
      // First check if Supabase connection is available
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Session check before auth attempt:', {
          hasExistingSession: !!sessionData?.session
        });
      } catch (sessionError) {
        console.error('Session check failed:', sessionError);
        // Continue anyway as this is just diagnostic
      }
      
      if (isSignUp) {
        console.log('Beginning sign up process');
        result = await signUp(email, password, name);
        console.log('Sign up result:', result);
        if (result.success) {
          setSuccess('Account created successfully! Welcome to AAFairShare.');
        } else {
          throw new Error(result.message || 'Sign up failed. Please try again.');
        }
      } else {
        console.log('Beginning sign in process');
        result = await signIn(email, password);
        console.log('Sign in result:', result);
        if (result.success) {
          setSuccess('Welcome back!');
          
          // Force a navigation after successful sign-in, don't wait for redirect effect
          const redirectTo = location.state?.from?.pathname || '/';
          console.log('Authentication successful, forcing navigation to:', redirectTo);
          
          // Use a small timeout to allow state updates first
          setTimeout(() => {
            navigate(redirectTo, { replace: true });
          }, 500);
        } else {
          throw new Error(result.message || 'Sign in failed. Please check your credentials and try again.');
        }
      }
      console.log('Authentication succeeded');
    } catch (err) {
      console.error('Auth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during authentication';
      setError(errorMessage);
      
      // Log additional debugging information
      console.error('Detailed auth error:', {
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      setSuccess(false);
    } finally {
      console.log('Setting loading state to false');
      setLoading(false);
    }
  };

  // Force clear loading state if component unmounts while loading
  useEffect(() => {
    return () => {
      if (loading) {
        console.log('Component unmounting while loading, forcing cleanup');
        setLoading(false);
      }
    };
  }, [loading]);

  // Add an effect to monitor the loading state
  useEffect(() => {
    console.log('Loading state changed:', { loading, success, error });
  }, [loading, success, error]);

  // Add a reset handler function
  const handleReset = () => {
    console.log('Manually resetting form state');
    setLoading(false);
    setSuccess(false);
    setError('');
    setLoadingMessage('');
  };

  // Handle reset auth state
  const handleResetAuth = async () => {
    console.log('Manually resetting auth state');
    setLoading(true);
    setLoadingMessage('Resetting authentication state...');
    
    try {
      const result = await resetAuthState();
      console.log('Auth state reset result:', result);
      
      if (result) {
        // If user is actually authenticated, let the redirect handle navigation
        if (user) {
          setSuccess('Authentication state reset successful!');
        } else {
          // Otherwise show message and reset form
          setSuccess('Authentication state reset. Please sign in again.');
          setEmail('');
          setPassword('');
        }
      } else {
        setError('Failed to reset authentication state. Please try again.');
      }
    } catch (err) {
      console.error('Error resetting auth state:', err);
      setError('Error resetting authentication. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      {/* App Logo or Name */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-rose-600">AAFairShare</h1>
        <p className="text-sm text-gray-500">Split expenses fairly with friends and family</p>
      </div>
      
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isSignUp ? 'Start tracking your expenses' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {typeof success === 'string' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            {success}
          </div>
        )}

        {loading && loadingMessage && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm">
            {loadingMessage}
            {loadingMessage.includes('Reset') && (
              <button 
                onClick={handleReset}
                className="mt-2 w-full py-1.5 px-3 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="John Doe"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-5 w-5 mr-2" />
            )}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Add troubleshooting section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2 text-center">Having trouble signing in?</p>
          <button
            type="button"
            onClick={handleResetAuth}
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
          >
            Reset Authentication State
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to={isSignUp ? '/login' : '/signup'}
            className="text-sm text-rose-600 hover:text-rose-500 focus:outline-none focus:underline transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} AAFairShare. All rights reserved.
      </div>
    </div>
  );
} 