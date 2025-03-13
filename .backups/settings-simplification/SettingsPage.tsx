import React, { useState } from 'react';
import { User, Check } from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { CategoryManager } from './CategoryManager';
import { LocationManager } from './LocationTagManager';
import { createLogger } from '../../../utils/logger';

// Create a logger for this module
const logger = createLogger('SettingsPage');

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // No need to load settings for currency or language
  
  // Simplified form submission - no preferences to update
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update settings');
      return;
    }
    
    setSuccess('Settings updated successfully');
    logger.info('Settings updated');
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <div className="py-8">
          <div className="bg-gray-100 inline-flex p-4 mb-4 rounded-full">
            <User size={24} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sign in to access settings</h3>
          <p className="text-gray-600 mb-4">Customize your experience and manage your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        </div>
        
        <div className="p-6">
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
              <Check size={16} className="mr-2" />
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                  <User size={18} className="mr-2 text-gray-500" />
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="w-full sm:max-w-md px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Your email address cannot be changed.</p>
                  </div>
                </div>
              </div>

              {/* Category and Location Management */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-medium text-gray-800 mb-4">Category and Location Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your expense categories and locations to better organize your spending.
                </p>
                
                <div className="space-y-8">
                  {/* Category Management Section */}
                  <CategoryManager />

                  {/* Location Management Section */}
                  <LocationManager />
                </div>
              </div>
              
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}