import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  calculateUserBalances, 
  createSettlement as createNewSettlement, 
  getUserSettlements, _markSettlementComplete,
  BalanceResult,
  Settlement
} from '../features/settlements/api/settlement-operations';

interface MonthlyExpense {
  month: string;
  netBalance: number;
  totalExpenses: number;
  [key: string]: unknown;
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
  currency?: string;
}

interface SettlementsResult {
  settlements: Settlement[];
  settlementsByMonth: {
    [key: string]: Settlement[];
  };
}

// Get current user
const _getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Calculate balances and monthly expenses
export const calculateBalances = async (): Promise<BalanceResult> => {
  try {
    return await calculateUserBalances();
  } catch (error) {
    console.error('Error in calculateBalances service:', error);
    return { monthlyExpenses: [], totalUnsettledAmount: '0.00' };
  }
};

// Create a settlement record
export const createSettlement = async (
  monthYear: string,
  amount: number,
  currency: string = 'GBP'
): Promise<Settlement> => {
  try {
    return await createNewSettlement(monthYear, amount, currency);
  } catch (error) {
    console.error('Error in createSettlement service:', error);
    throw error;
  }
};

// Get settlements for the current user
export const getSettlements = async (): Promise<{
  settlements: Settlement[];
  settlementsByMonth: { [key: string]: Settlement[] };
}> => {
  try {
    return await getUserSettlements();
  } catch (error) {
    console.error('Error in getSettlements service:', error);
    return { settlements: [], settlementsByMonth: {} };
  }
};

// Complete a settlement for a specific month
export const completeSettlement = async (
  monthYear: string,
  amount: number,
  isPartial: boolean = false
): Promise<Settlement> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate amount parameter
    if (amount === undefined || amount === null) {
      throw new Error('Settlement amount is required');
    }

    // Format amount to ensure it's a number with 2 decimal places
    const formattedAmount = parseFloat(String(amount)).toFixed(2);

    // Check if the user actually owes money for this month
    const { monthlyExpenses } = await calculateBalances();
    const monthData = monthlyExpenses.find(m => m.month === monthYear);
    
    if (!monthData) {
      throw new Error(`Month ${monthYear} not found in expenses`);
    }
    
    // Current user owes money if netBalance is negative
    if (monthData.netBalance >= 0) {
      throw new Error('Only the user who owes money can mark a settlement as complete');
    }

    // Check if this month can be settled (must be a past month)
    const [monthName, yearStr] = monthYear.split(' ');
    const year = parseInt(yearStr);
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Allow settlement only if the month has passed (we're in a later month/year)
    const canSettle = (year < currentYear) || (year === currentYear && monthIndex < currentMonth);
    
    if (!canSettle) {
      throw new Error('Cannot settle the current month. Wait until the 1st of next month to settle.');
    }

    // Check for existing settlements for this month
    const { data: existingSettlements } = await supabase
      .from('settlements')
      .select('*')
      .eq('month_year', monthYear)
      .eq('status', 'completed');

    // Calculate total already paid
    const _totalAlreadyPaid = (existingSettlements || [])
      .reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);

    // Check if the full amount is being settled or if it's a partial payment
    const status = isPartial ? 'partial' : 'completed';

    // Create a new settlement record
    const { data: settlement, error } = await supabase
      .from('settlements')
      .insert({
        user_id: user.id,
        month_year: monthYear,
        amount: formattedAmount,
        status: status,
        settled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return settlement;
  } catch (error) {
    console.error('Error in completeSettlement service:', error);
    throw error;
  }
};

// Unsettle a month (delete all settlements for that month)
export const unsettleMonth = async (monthYear: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Delete all settlements for this month
    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('month_year', monthYear);

    if (error) throw error;
    return { success: true, message: `${monthYear} has been unsettled` };
  } catch (error) {
    console.error('Error in unsettleMonth service:', error);
    throw error;
  }
};

// Get all partial payments for a month
export const getPartialPayments = async (monthYear: string): Promise<Settlement[]> => {
  try {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('month_year', monthYear)
      .order('settled_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting partial payments:', error);
    throw error;
  }
};

// Get all partial payments for multiple months at once
export const getAllPartialPayments = async (
  monthYears: string[]
): Promise<{ [key: string]: Settlement[] }> => {
  try {
    if (!monthYears || monthYears.length === 0) {
      return {};
    }

    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .in('month_year', monthYears)
      .order('settled_at', { ascending: true });

    if (error) throw error;

    // Group payments by month
    const paymentsByMonth: { [key: string]: Settlement[] } = {};
    (data || []).forEach(payment => {
      if (!paymentsByMonth[payment.month_year]) {
        paymentsByMonth[payment.month_year] = [];
      }
      paymentsByMonth[payment.month_year].push(payment);
    });

    return paymentsByMonth;
  } catch (error) {
    console.error('Error getting all partial payments:', error);
    throw error;
  }
}; 