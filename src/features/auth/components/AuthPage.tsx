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
      if (location.pathname !== redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [user, profile, navigate, location]);

  // Test styles
  const testClasses = "bg-red-500 text-white p-4 rounded-lg shadow-lg fixed top-4 right-4";

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err) {
      console.error('Auth error:', err);
      setError('An error occurred during authentication');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isSignUp ? 'Start tracking your expenses' : 'Sign in to your account'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>

      {/* Test element */}
      <div className={testClasses}>
        If you can see this styled in red, Tailwind is working!
      </div>
    </div>
  );
} 