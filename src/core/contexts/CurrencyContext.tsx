import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import { createLogger } from '../utils/logger';

// Create a logger for this module
const logger = createLogger('CurrencyContext');

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  supportedCurrencies: Record<string, { symbol: string; name: string }>;
  formatAmount: (amount: number) => string;
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

  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('user_settings')
          .select('currency')
          .eq('user_id', session.user.id)
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
  }, []);

  const changeCurrency = async (newCurrency: string) => {
    if (supportedCurrencies[newCurrency]) {
      setCurrency(newCurrency);
      
      if (session) {
        // Update the currency in the preferences object
        const updatedPreferences = {
          ...(session.user.preferences || {}),
          currency: newCurrency
        };
        
        try {
          await supabase
            .from('user_settings')
            .update({ preferences: updatedPreferences })
            .eq('user_id', session.user.id);
          logger.info('Currency preference updated', { currency: newCurrency });
        } catch (error) {
          logger.error('Failed to update currency preference', error);
        }
      }
    }
  };

  const formatAmount = (amount: number): string => {
    const symbol = supportedCurrencies[currency]?.symbol || '£';
    
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
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