import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { LogOut, ChevronDown, User } from 'lucide-react';

const UserSelect = () => {
  const { login, currentUser, logout, error: storeError } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isResetMode) {
        // TODO: Implement password reset
        alert('Password reset functionality coming soon!');
        setIsResetMode(false);
      } else {
        const success = await login(email, password);
        if (!success) {
          setError('Invalid email or password');
        } else {
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setError(isResetMode ? 'Password reset failed' : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setShowDropdown(false);
    } catch (err) {
      setError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm text-gray-700">{currentUser.name}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">
            {isResetMode ? 'Enter your email to reset password' : 'Sign in to manage your expenses'}
          </p>
        </div>

        {(error || storeError) && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error || storeError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              required
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>

          {!isResetMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            {isResetMode ? 'Reset Password' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setIsResetMode(!isResetMode)}
            className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isResetMode ? 'Back to Sign In' : 'Forgot Password?'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSelect;
