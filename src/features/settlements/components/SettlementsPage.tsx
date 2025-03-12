import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { 
  calculateUserBalances,
  getUserSettlements,
  createSettlement
} from '../api/settlement-operations';
import { useAuth } from '../../../core/contexts/AuthContext';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { ErrorBoundary, StatusMessage } from '../../shared/components';
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import { supabase } from '../../../core/api/supabase';
import SettlementBalanceCards from './SettlementBalanceCards';
import SettlementList from './SettlementList';

/**
 * Interfaces for type safety
 */
interface MonthlyExpense {
  month: string;
  expenses: any[];
  total: number;
  totalPaidByCurrentUser: number;
  totalPaidByOtherUser: number;
  netBalance: number;
  equalSplitTotal: number;
  noSplitTotal: number;
  isSettled: boolean;
  settlementAmount: number;
  settlementDate: string | null;
  settlementId: string | null;
  settledByCurrentUser: boolean;
}

interface Settlement {
  id: string;
  user_id: string;
  month_year: string;
  amount: string;
  status: 'partial' | 'completed';
  settled_at: string;
  created_at?: string;
  updated_at?: string;
}

interface BalanceData {
  monthlyExpenses: MonthlyExpense[];
  totalUnsettledAmount: string;
}

interface SettlementData {
  settlements: any[];  // Using any to fix compatibility issues
  settlementsByMonth: {
    [key: string]: any[];  // Using any to fix compatibility issues
  };
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  title?: string;
  message?: string;
  onReset?: () => Promise<void>;
}

interface CustomError extends Error {
  message: string;
  [key: string]: any;
}

/**
 * SettlementsPage Component - Main component for managing settlements between users
 */
export default function SettlementsPage() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [balances, setBalances] = useState<BalanceData>({ 
    monthlyExpenses: [],
    totalUnsettledAmount: '0.00'
  });
  const [settlements, setSettlements] = useState<SettlementData>({ 
    settlements: [], 
    settlementsByMonth: {} 
  });
  const [partialPaymentMode, setPartialPaymentMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [partialAmount, setPartialAmount] = useState('');
  const [partialPayments, setPartialPayments] = useState<{[key: string]: any[]}>({});
  const [activeTab, setActiveTab] = useState('active');
 
  // Error handling using our custom hook
  const {
    error,
    isLoading: loading,
    clearError,
    setError,
    handleError,
    setIsLoading
  } = useErrorHandler({ context: 'SettlementsPage' });
  
  // Success messaging
  const [success, setSuccess] = useState('');
  
  // Reference to prevent multiple quick submit attempts
  const _isSubmitting = useRef(false);

  /**
   * Get settlement details for a month
   * @param {string} monthYear - Month and year
   * @returns {object|null} - Settlement details or null
   */
  const getSettlementDetails = (monthYear: string) => {
    return settlements.settlements?.find(s => s.month_year === monthYear) || null;
  };

  /**
   * Load settlements data including balances and partial payments
   */
  const loadSettlementData = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      setSuccess('');
      
      // Load balances and settlements data as _data
      const [balancesData, settlementsData] = await Promise.all([
        calculateUserBalances(),
        getUserSettlements()
      ]);
      
      console.log("Raw balances _data from API:", balancesData);
      
      // Ensure balancesData has the expected structure
      const formattedBalances = {
        monthlyExpenses: Array.isArray(balancesData.monthlyExpenses) 
          ? balancesData.monthlyExpenses.map(month => ({
              ...month,
              // Ensure numeric values are actually numbers
              netBalance: typeof month.netBalance === 'number' ? month.netBalance : parseFloat(month.netBalance || '0'),
              total: typeof month.total === 'number' ? month.total : parseFloat(month.total || '0'),
              totalPaidByCurrentUser: typeof month.totalPaidByCurrentUser === 'number' 
                ? month.totalPaidByCurrentUser 
                : parseFloat(month.totalPaidByCurrentUser || '0'),
              totalPaidByOtherUser: typeof month.totalPaidByOtherUser === 'number' 
                ? month.totalPaidByOtherUser 
                : parseFloat(month.totalPaidByOtherUser || '0')
            }))
          : [],
        totalUnsettledAmount: balancesData.totalUnsettledAmount || '0.00'
      };
      
      console.log("Formatted balances _data:", formattedBalances);
      setBalances(formattedBalances);
      setSettlements(settlementsData);
      
    } catch (error) {
      if (error instanceof Error) {
        handleError(error as CustomError, 'Failed to load settlement _data. Please try again.');
      } else {
        handleError({ message: 'Unknown error' } as CustomError, 'Failed to load settlement _data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, clearError, setBalances, setSettlements, handleError]);

  useEffect(() => {
    loadSettlementData();
  }, [user, loadSettlementData]);

  /**
   * Handle settling a month
   * @param {string} monthYear - Month and year to settle
   * @param {number} amount - Amount to settle
   * @param {boolean} isPartial - Whether this is a partial payment
   */
  const handleSettleMonth = async (monthYear: string, amount: number, isPartial = false) => {
    try {
      setIsLoading(true);
      setSuccess('');
      
      // For now, just use createSettlement which still exists
      await createSettlement(monthYear, amount);
      
      // Show success message
      setSuccess(`_Settlement for ${monthYear} ${isPartial ? 'partially' : 'fully'} processed successfully`);
      
      // Exit partial payment mode after settlement
      setPartialPaymentMode(false);
      setSelectedMonth(null);
      setPartialAmount('');
      
      // Reload data
      await loadSettlementData();
    } catch (error: any) {
      handleError(error, 'Failed to settle expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle unsettling a month
   * @param {string} monthYear - Month and year to unsettle
   */
  const handleUnsettleMonth = async (monthYear: string) => {
    try {
      setIsLoading(true);
      setSuccess('');
      
      // Get the settlement ID for this month
      const settlementDetails = getSettlementDetails(monthYear);
      
      if (!settlementDetails || !settlementDetails.id) {
        setError(`Could not find settlement details for ${monthYear}`);
        return;
      }
      
      // Call the API to delete the settlement
      const { error } = await supabase
        .from('settlements')
        .delete()
        .eq('id', settlementDetails.id);
      
      if (error) {
        throw error;
      }
      
      // Show success message
      setSuccess(`${monthYear} has been unsettled successfully`);
      
      // Reload data
      await loadSettlementData();
    } catch (error: any) {
      handleError(error, 'Failed to unsettle month. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle partial payment amount change
   * @param {object} e - Event object
   */
  const handlePartialPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPartialAmount(value);
  };

  /**
   * Toggle partial payment mode for a month
   * @param {string} monthYear - Month and year to toggle partial payment for
   */
  const togglePartialPayment = (monthYear: string) => {
    // If we're already in partial payment mode for this month, exit the mode
    if (partialPaymentMode && selectedMonth === monthYear) {
      setPartialPaymentMode(false);
      setSelectedMonth(null);
      setPartialAmount('');
      return;
    }
    
    // Otherwise, enter partial payment mode for this month
    setPartialPaymentMode(true);
    setSelectedMonth(monthYear);
    setPartialAmount('');
  };

  /**
   * Check if a month is the current month
   * @param {string} monthYear - Month and year to check
   * @returns {boolean} - Whether the month is the current month
   */
  const isCurrentMonth = (monthYear: string): boolean => {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();
    const currentMonthYear = `${currentMonth} ${currentYear}`;
    return monthYear === currentMonthYear;
  };

  /**
   * Check if a month can be settled (must be past month)
   * @param {string} monthYear - Month and year to check
   * @returns {boolean} - Whether the month can be settled
   */
  const canSettleMonth = (monthYear: string): boolean => {
    // Parse month and year
    const [monthName, yearStr] = monthYear.split(' ');
    const year = parseInt(yearStr);
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Month can be settled if it's in the past
    return (year < currentYear) || (year === currentYear && monthIndex < currentMonth);
  };
}