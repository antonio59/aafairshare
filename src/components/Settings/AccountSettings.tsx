import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/userStore';
import FaviconSettings from './FaviconSettings';

const AccountSettings = () => {
  const { currentUser, updateUser, updatePassword } = useUserStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('AccountSettings mounted, currentUser:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    console.log('About to render FaviconSettings');
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (currentUser) {
      try {
        await updatePassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setSuccessMessage('Password updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setPasswordError(error instanceof Error ? error.message : 'Failed to update password');
      }
    }
  };

  const handleCurrencyChange = (currency: string) => {
    if (currentUser) {
      updateUser({
        preferences: {
          ...currentUser.preferences,
          currency,
        },
      });
    }
  };

  if (!currentUser) {
    console.log('No currentUser, returning null');
    return null;
  }

  console.log('Rendering AccountSettings with currentUser:', currentUser);

  return (
    <div className="space-y-6">
      {/* Basic Account Settings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currentUser.preferences.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="GBP">British Pound (£)</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Favicon Settings */}
      <FaviconSettings />

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {passwordError}
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
