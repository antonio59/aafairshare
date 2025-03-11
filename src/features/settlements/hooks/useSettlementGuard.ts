import { useState, useEffect } from 'react';
import { supabase } from '@/core/api/supabase';
import { formatMonthYear } from '../../../utils/date-utils';

/**
 * Result object returned by the useSettlementGuard hook
 * Contains information about the settlement status of an expense
 */
interface SettlementGuardResult {
  /** Whether the settlement status is still being checked */
  isLoading: boolean;
  /** Whether the expense belongs to a month that has been settled */
  isSettled: boolean;
  /** The month and year of the expense in "Month YYYY" format */
  monthYear: string;
  /** User-friendly message explaining the settlement status */
  message: string;
}

/**
 * Expense structure with minimal fields needed for settlement check
 */
interface Expense {
  /** Unique identifier of the expense */
  id: string;
  /** Date of the expense in ISO format */
  date: string;
}

/**
 * Settlement record structure from the database
 */
interface Settlement {
  /** Unique identifier of the settlement */
  id: string;
  /** Status of the settlement */
  status: 'completed' | 'pending';
  /** Month and year of the settlement in "Month YYYY" format */
  month_year: string;
}

/**
 * Hook to check if an expense belongs to a settled month
 * 
 * This hook performs the following:
 * 1. Validates the expense ID format
 * 2. Retrieves the expense date
 * 3. Checks if the month of the expense has been settled
 * 4. Returns settlement status information
 * 
 * @param expenseId - The expense ID to check
 * @returns Object containing isLoading, isSettled, monthYear and message
 */
export function useSettlementGuard(expenseId: string | null): SettlementGuardResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [monthYear, setMonthYear] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const checkSettlementStatus = async () => {
      if (!expenseId) {
        setIsLoading(false);
        return;
      }

      // Additional validation for UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(expenseId)) {
        console.error('Invalid UUID format in useSettlementGuard:', expenseId);
        setMessage('Invalid expense ID format');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Safely fetch the expense with better error handling
        const expenseResponse = await supabase
          .from('expenses')
          .select('id, date')
          .eq('id', expenseId)
          .single();
        
        if (expenseResponse.error) {
          console.error('Error fetching expense:', expenseResponse.error);
          setMessage(`Error: ${expenseResponse.error.message || 'Failed to check expense'}`);
          setIsLoading(false);
          return;
        }
        
        if (!expenseResponse.data) {
          setMessage('_Expense not found');
          setIsLoading(false);
          return;
        }
        
        // Safe access to data
        const expense = {
          id: expenseResponse.data.id || '',
          date: expenseResponse.data.date || ''
        };

        // Format date to Month YYYY
        const monthYear = formatMonthYear(expense.date);
        setMonthYear(monthYear);

        // Check if the month is settled
        const settlementsResponse = await supabase
          .from('settlements')
          .select('id, status, month_year')
          .eq('month_year', monthYear)
          .eq('status', 'completed');

        if (settlementsResponse.error) {
          console.error('Error checking settlements:', settlementsResponse.error);
          setMessage(`Error: ${settlementsResponse.error.message || 'Failed to check settlement status'}`);
          setIsLoading(false);
          return;
        }

        // If data is not an array, use an empty array
        const settlements = Array.isArray(settlementsResponse.data) ? settlementsResponse.data : [];
        
        const isMonthSettled = settlements.length > 0;
        setIsSettled(isMonthSettled);
        
        if (isMonthSettled) {
          setMessage(`Cannot edit this expense because ${monthYear} has been settled. Please unsettle the month first before making changes.`);
        }
      } catch (error) {
        console.error('Error checking settlement status:', error);
        setMessage('Failed to check settlement status');
      } finally {
        setIsLoading(false);
      }
    };

    checkSettlementStatus();
  }, [expenseId]);

  return { isLoading, isSettled, monthYear, message };
} 