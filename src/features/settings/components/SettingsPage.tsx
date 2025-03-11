import React, { useState, useEffect } from 'react';
import { _Link } from 'react-router-dom';
import { User, _Mail, CreditCard, Globe, _Shield, Check } from 'lucide-react';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { useAuth } from '../../../core/contexts/AuthContext';
import { CategoryManager } from './CategoryManager';
import { LocationManager } from './LocationTagManager';
import { ImportExportSection } from './ImportExportSection';
import { getGlobalSettings, getUserSettings, updateUserSettings } from '../../../services/settingsService';
import { _ErrorBoundary, _LoadingSpinner, _StatusMessage } from '../../shared/components';
import { _useErrorHandler } from '../../shared/hooks/useErrorHandler';
import { createLogger } from '../../../utils/logger';

// Create a logger for this module
const logger = createLogger('SettingsPage');

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { currency, changeCurrency, supportedCurrencies } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [globalSettings, setGlobalSettings] = useState({
    app_currencies: [],
    default_language: 'en',
    default_currency: 'GBP'
  });
  
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Load global and user settings in parallel
        const [globalSettingsData, userSettingsData] = await Promise.all([
          getGlobalSettings(),
          getUserSettings(user.id)
        ]);

        setGlobalSettings(globalSettingsData);
        
        // Set user preferences
        if (userSettingsData) {
          setSelectedLanguage(userSettingsData.language);
          // Use the currency from preferences object
          setSelectedCurrency(userSettingsData.preferences?.currency || globalSettingsData.default_currency);
          logger.info('Settings loaded', { 
            language: userSettingsData.language,
            currency: userSettingsData.preferences?.currency
          });
        }
      } catch (err) {
        logger.error('Error loading settings', err);
        setError('Failed to load settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update settings');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Update the user's currency preference in the preferences object
      const currentPreferences = profile?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        currency: selectedCurrency
      };
      
      // Update user settings
      await updateUserSettings(user.id, {
        preferences: updatedPreferences,
        language: selectedLanguage
      });
      
      // Update the currency in the context
      if (selectedCurrency !== currency) {
        await changeCurrency(selectedCurrency);
      }
      
      setSuccess('Settings updated successfully');
      logger.info('Settings updated', { 
        currency: selectedCurrency,
        language: selectedLanguage
      });
    } catch (err) {
      logger.error('Error updating settings', err);
      setError('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
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
              
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                  <Globe size={18} className="mr-2 text-gray-500" />
                  Language Settings
                </h3>
                
                <div className="mb-4">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Choose your preferred language for the application interface.</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-medium text-gray-800 mb-4 flex items-center">
                  <CreditCard size={18} className="mr-2 text-gray-500" />
                  Currency Preferences
                </h3>
                
                <div className="mb-4">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    {globalSettings.app_currencies && Array.isArray(globalSettings.app_currencies) ? 
                      globalSettings.app_currencies.map((code) => {
                        const currencyCode = typeof code === 'string' ? code.replace(/"/g, '') : code;
                        return (
                          <option key={currencyCode} value={currencyCode}>
                            {currencyCode} - {supportedCurrencies[currencyCode]?.name} ({supportedCurrencies[currencyCode]?.symbol})
                          </option>
                        );
                      })
                    : Object.keys(supportedCurrencies).map(code => (
                      <option key={code} value={code}>
                        {code} - {supportedCurrencies[code]?.name} ({supportedCurrencies[code]?.symbol})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">This will be used as the default currency for new expenses.</p>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  {globalSettings.app_currencies && Array.isArray(globalSettings.app_currencies) ? 
                    globalSettings.app_currencies.map((code) => {
                      // Handle if code is an object or has quotes
                      const currencyCode = typeof code === 'string' ? code.replace(/"/g, '') : code;
                      return (
                        <button
                          key={currencyCode}
                          type="button"
                          onClick={() => setSelectedCurrency(currencyCode)}
                          className={`px-3 py-2 rounded-lg flex items-center text-sm ${
                            selectedCurrency === currencyCode 
                              ? 'bg-rose-100 text-rose-700 border-rose-200 border' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="font-medium mr-1">{supportedCurrencies[currencyCode]?.symbol}</span>
                          <span>{currencyCode}</span>
                        </button>
                      );
                    })
                  : null}
                </div>
              </div>

              {/* Import/Export Section */}
              <ImportExportSection />

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