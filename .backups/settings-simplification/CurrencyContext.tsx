import React, { createContext, useContext } from 'react';
import { createLogger } from '../utils/logger';

// Create a logger for this module
const logger = createLogger('CurrencyContext');

interface CurrencyContextType {
  currency: string;
  formatAmount: (amount: number) => string;
  formatCurrency: (amount: number) => string;
}

// Simplified context that only uses GBP
const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Always use GBP as the currency - no need for state or preferences
  const currency = 'GBP';
  
  const formatAmount = (amount: number): string => {
    // Always use the GBP symbol
    return `£${parseFloat(amount.toString()).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      formatAmount,
      formatCurrency: formatAmount, // Alias for formatAmount for consistency
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