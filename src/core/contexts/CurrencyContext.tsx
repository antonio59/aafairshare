import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { createLogger } from '../utils/logger';
import { useAuth } from './AuthContext'; // Import useAuth to access the user session

// Create a logger for this module
const logger = createLogger('CurrencyContext');

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  changeCurrency?: (newCurrency: string) => Promise<void>;
  formatAmount: (amount: number) => string;
  formatCurrency?: (amount: number) => string;
  supportedCurrencies: Record<string, { symbol: string; name: string }>;
}

const supportedCurrencies = {
  GBP: { symbol: '£', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
} as const;

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<string>('GBP');
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        if (!user?.id) return;

        const { data, error } = await supabase
          .from('user_settings')
          .select('currency')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data?.currency) {
          setCurrency(data.currency);
          logger.info('Currency set from user preferences', { currency: data.currency });
        }
      } catch (error) {
        logger.error('Error loading user currency:', error);
      }
    };

    loadUserCurrency();
  }, [user]);

  const changeCurrency = async (newCurrency: string) => {
    if (supportedCurrencies[newCurrency]) {
      setCurrency(newCurrency);
      
      if (user?.id) {
        // Update the currency in the preferences object
        try {
          const { data: userData } = await supabase
            .from('user_settings')
            .select('preferences')
            .eq('user_id', user.id)
            .single();
            
          const updatedPreferences = {
            ...(userData?.preferences || {}),
            currency: newCurrency
          };
          
          await supabase
            .from('user_settings')
            .update({ preferences: updatedPreferences })
            .eq('user_id', user.id);
          logger.info('Currency preference updated', { currency: newCurrency });
        } catch (error) {
          logger.error('Failed to update currency preference', error);
        }
      }
    }
  };

  const formatAmount = (amount: number): string => {
    const symbol = supportedCurrencies[currency]?.symbol || '£';
    
    return `${symbol}${parseFloat(amount.toString()).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      changeCurrency,
      formatAmount,
      formatCurrency: formatAmount, // Alias for formatAmount for consistency
      supportedCurrencies,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}