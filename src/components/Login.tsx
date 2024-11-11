import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface LocationState {
  from?: Location;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useUserStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        // Get the redirect path from location state, or default to home
        const state = location.state as LocationState;
        const from = state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError('Failed to authenticate. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        // Handle specific Firebase auth errors
        if (error.message.includes('auth/wrong-password')) {
          setError('Invalid password. If you forgot your password, use the reset link below.');
        } else if (error.message.includes('auth/user-not-found')) {
          setError('No account found with this email address.');
        } else if (error.message.includes('auth/too-many-requests')) {
          setError('Too many failed attempts. Please try again later or reset your password.');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setError('');
    setMessage('');
    setIsResetting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
      setPassword(''); // Clear password field after reset request
    } catch (error) {
      console.error('Reset password error:', error);
      if (error instanceof Error) {
        if (error.message.includes('auth/user-not-found')) {
          setError('No account found with this email address.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            AA FairShare
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isResetting}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isResetting}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="#"
                onClick={handleResetPassword}
                className="font-medium text-blue-600 hover:text-blue-500"
                style={{ pointerEvents: isLoading || isResetting ? 'none' : 'auto' }}
              >
                {isResetting ? 'Sending reset email...' : 'Forgot your password?'}
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isResetting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
