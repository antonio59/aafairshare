import React, { useState, useEffect, useRef } from 'react';
import { _AlertTriangle, _Check } from 'lucide-react';
import { 
  calculateUserBalances,
  getUserSettlements, _markSettlementComplete,
  createSettlement
} from '../api/settlement-operations';
import { useAuth } from '../../../core/contexts/AuthContext';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { ErrorBoundary, _LoadingSpinner, StatusMessage } from '../../shared/components';
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import { _formatDateToUK } from '../../shared/utils/date-utils';
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
    handleError, _withErrorHandling,
    setIsLoading
  } = useErrorHandler({ context: 'SettlementsPage' });
  
  // Success messaging
  const [success, setSuccess] = useState('');
  
  // Reference to prevent multiple quick submit attempts
  const _isSubmitting = useRef(false);

  useEffect(() => {
    loadSettlementData();
  }, [user]);

  /**
   * Load settlements data including balances and partial payments
   */
  const loadSettlementData = async () => {
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
  };

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
      const { _data, error } = await supabase
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

  /**
   * Determine if the current user owes money for a month
   * @param {object} monthData - Month data
   * @returns {boolean} - Whether the current user owes money
   */
  const currentUserOwesForMonth = (monthData: any): boolean => {
    // If netBalance is negative, the user owes money
    return monthData.netBalance < 0;
  };

  /**
   * Get settlement details for a month
   * @param {string} monthYear - Month and year
   * @returns {object|null} - Settlement details or null
   */
  const getSettlementDetails = (monthYear: string) => {
    return settlements.settlements?.find(s => s.month_year === monthYear) || null;
  };

  /**
   * Calculate total partial payments for a month
   * @param {string} monthYear - Month and year
   * @returns {number} - Total partial payments
   */
  const getTotalPartialPayments = (monthYear: string): number => {
    const payments = partialPayments[monthYear] || [];
    return payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount || 0), 0);
  };

  /**
   * Check if month has partial payments
   * @param {string} monthYear - Month and year
   * @returns {boolean} - Whether the month has partial payments
   */
  const hasPartialPayments = (monthYear: string): boolean => {
    return partialPayments[monthYear] && partialPayments[monthYear].length > 0;
  };

  /**
   * Get remaining amount to pay after partial payments
   * @param {object} monthData - Month data
   * @returns {number} - Remaining amount
   */
  const getRemainingAmount = (monthData: any): number => {
    // Ensure we have valid numeric values
    const ensureNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value) || 0;
      return 0;
    };
    
    // Calculate total partial payments
    const totalPartial = getTotalPartialPayments(monthData.month);
    
    // Calculate the amount owed (absolute value of netBalance)
    const netBalance = ensureNumber(monthData.netBalance);
    const owedAmount = Math.abs(netBalance);
    
    // Return the remaining amount (at least 0)
    return Math.max(0, owedAmount - totalPartial);
  };

  // Filter active and settled months
  const activeMonths = balances.monthlyExpenses?.filter(month => 
    !settlements.settlements?.some(s => 
      s.month_year === month.month && s.status === 'completed'
    )
  ) || [];

  const settledMonths = balances.monthlyExpenses?.filter(month => 
    settlements.settlements?.some(s => 
      s.month_year === month.month && s.status === 'completed'
    )
  ) || [];

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <p className="text-gray-600">Please log in to view settlements.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallback={
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Settlements</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading your settlements data as _data.</p>
          <button 
            onClick={() => loadSettlementData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Balance Cards */}
        <SettlementBalanceCards 
          balances={balances} 
          loading={loading} 
          formatAmount={formatAmount}
        />

        {/* Success/Error Messages */}
        {error && (
          <StatusMessage 
            type="error" 
            message={error} 
            onDismiss={clearError}
          />
        )}
        
        {success && (
          <StatusMessage 
            type="success" 
            message={success} 
            onDismiss={() => setSuccess('')}
          />
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              className={`pb-4 px-1 ${activeTab === 'active' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Months
            </button>
            <button
              className={`pb-4 px-1 ${activeTab === 'settled' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('settled')}
            >
              Settled History
            </button>
          </nav>
        </div>

        {/* Settlement as _Settlement as _Settlement List */}
        <SettlementList 
          months={activeTab === 'active' ? activeMonths : settledMonths}
          activeTab={activeTab}
          loading={loading}
          formatAmount={formatAmount}
          partialPaymentMode={partialPaymentMode}
          selectedMonth={selectedMonth}
          partialAmount={partialAmount}
          handlePartialPaymentChange={handlePartialPaymentChange}
          togglePartialPayment={togglePartialPayment}
          handleSettleMonth={handleSettleMonth}
          handleUnsettleMonth={handleUnsettleMonth}
          hasPartialPayments={hasPartialPayments}
          getRemainingAmount={getRemainingAmount}
          isCurrentMonth={isCurrentMonth}
          canSettleMonth={canSettleMonth}
          currentUserOwesForMonth={currentUserOwesForMonth}
          getSettlementDetails={getSettlementDetails}
          getTotalPartialPayments={getTotalPartialPayments}
        />
      </div>
    </ErrorBoundary>
  );
}