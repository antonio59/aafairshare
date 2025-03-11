import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, User, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { _supabase } from '../../../core/api/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && profile) {
      const redirectTo = location.state?.from?.pathname || '/';
      // Only redirect if we're not already on the target page
      if (location.pathname !== redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, profile, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      let result;
      if (isSignUp) {
        result = await signUp(email, password, name);
        if (result.success) {
          setSuccess('Account created successfully! Welcome to AAFairShare.');
        } else {
          throw new Error(result.message);
        }
      } else {
        result = await signIn(email, password);
        if (result.success) {
          setSuccess('Welcome back!');
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred during authentication');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="mx-auto bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg px-6 py-4">
          <span className="text-xl font-bold text-white tracking-tight">AAFairShare</span>
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Start tracking your shared expenses' : 'Track and split expenses fairly'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {success}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Redirecting you to the dashboard...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                    placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                    minLength="6"
                    disabled={loading}
                  />
                </div>
                {isSignUp && (
                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {!success && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {isSignUp ? 'Already have an account?' : 'New to AAFairShare?'}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm font-medium text-rose-600 hover:text-rose-500"
                  disabled={loading}
                >
                  {isSignUp ? 'Sign in to your account' : 'Create a free account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 