/**
 * Settlement API functions for interacting with settlement data
 * @version 1.0.0
 */
import { supabase } from '../../../core/api/supabase';
import { createLogger } from '../../../core/utils/logger';
import { 
  Settlement, 
  SettlementCreate, 
  SettlementUpdate, 
  SettlementStatus,
  BalanceData,
  SettlementData,
  SettlementResponse,
  MonthlySettlementSummary,
  BalanceCalculationParams,
  PartialPayment
} from '../../../core/types/settlements';
import { Expense } from '../../../core/types/expenses';
import { formatDecimal, safeSum } from '../../../utils/number-utils';

// Create a logger for this module
const logger = createLogger('SettlementApi');

// Cache implementation
interface Cache<T> {
  data: T | null;
  timestamp: number;
  expiresAt: number;
}

// Cache settings
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const balancesCache: Cache<BalanceData> = { data: null, timestamp: 0, expiresAt: 0 };
const settlementsCache: Cache<SettlementData> = { data: null, timestamp: 0, expiresAt: 0 };

/**
 * Get cached data if available and not expired
 */
function getCachedData<T>(cache: Cache<T>): T | null {
  const now = Date.now();
  if (cache.data && now < cache.expiresAt) {
    logger.info('Using cached data from', new Date(cache.timestamp).toISOString());
    return cache.data;
  }
  return null;
}

/**
 * Update cache with new data
 */
function setCachedData<T>(cache: Cache<T>, data: T): void {
  const now = Date.now();
  cache.data = data;
  cache.timestamp = now;
  cache.expiresAt = now + CACHE_TTL;
  logger.info('Updated cache at', new Date(now).toISOString());
}

/**
 * Invalidate cache
 */
export function invalidateSettlementsCache(): void {
  logger.info('Invalidating settlements cache');
  balancesCache.data = null;
  balancesCache.timestamp = 0;
  balancesCache.expiresAt = 0;
  
  settlementsCache.data = null;
  settlementsCache.timestamp = 0;
  settlementsCache.expiresAt = 0;
}

/**
 * Format error response for API calls
 */
function formatError(error: any): SettlementResponse {
  logger.error('Settlement API error:', error);
  return {
    success: false,
    message: error?.message || 'An error occurred with the settlement operation',
    error
  };
}

/**
 * Format success response for API calls
 */
function formatSuccess<T>(data: T, message = 'Operation successful'): SettlementResponse {
  return {
    success: true,
    message,
    data: data as (Settlement | Settlement[] | null | undefined)
  };
}

/**
 * Calculate user balances based on expenses
 */
export async function calculateUserBalances(params: BalanceCalculationParams = {}): Promise<BalanceData> {
  try {
    // Check cache first
    const cached = getCachedData(balancesCache);
    if (cached) return cached;
    
    const { startDate, endDate, limit = 500 } = params;
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Build query for expenses
    let query = supabase
      .from('expenses')
      .select(`
        *,
        users(id, name, email),
        categories(id, category),
        locations(id, location)
      `)
      .order('date', { ascending: false });
    
    // Apply filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    // Execute query
    const { data: expensesData, error } = await query;
    
    if (error) {
      throw error;
    }
    
    if (!expensesData || !Array.isArray(expensesData)) {
      throw new Error('Invalid expenses data received');
    }
    
    // Process expenses into monthly summaries
    const monthlyMap = new Map<string, MonthlySettlementSummary>();
    let totalUnsettledAmount = 0;
    
    expensesData.forEach((rawExpense) => {
      // Skip invalid data
      if (!rawExpense?.date) return;
      
      // Format expense with proper types
      const expense = formatExpenseForUI(rawExpense, user.id);
      
      // Extract month and year
      const date = new Date(expense.date);
      const monthKey = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
      
      // Get or create monthly summary
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, createEmptyMonthlySummary(monthKey));
      }
      
      const monthlySummary = monthlyMap.get(monthKey)!;
      
      // Add expense to monthly data
      monthlySummary.expenses.push(expense);
      
      // Update monthly totals
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      
      monthlySummary.total += amount;
      
      if (expense.paid_by === user.id) {
        monthlySummary.totalPaidByCurrentUser += amount;
        
        if (expense.split_type === 'equal') {
          monthlySummary.equalSplitTotal += amount;
        } else {
          monthlySummary.noSplitTotal += amount;
          // If current user paid and no split, other user owes half
          monthlySummary.otherUserNoSplitOwes += amount;
        }
      } else {
        monthlySummary.totalPaidByOtherUser += amount;
        
        if (expense.split_type === 'equal') {
          // Nothing to do here, handled in net calculation
        } else {
          monthlySummary.noSplitTotal += amount;
          // If other user paid and no split, current user owes half
          monthlySummary.currentUserNoSplitOwes += amount;
        }
      }
    });
    
    // Get settlements data to mark settled months
    const { data: settlements } = await supabase
      .from('settlements')
      .select('*')
      .eq('user_id', user.id);
    
    // Process settlements
    if (settlements && Array.isArray(settlements)) {
      settlements.forEach(settlement => {
        if (monthlyMap.has(settlement.month_year)) {
          const monthlySummary = monthlyMap.get(settlement.month_year)!;
          
          monthlySummary.isSettled = settlement.status === 'completed';
          monthlySummary.settlementId = settlement.id;
          monthlySummary.settlementDate = settlement.settled_at || settlement.created_at;
          monthlySummary.settlementAmount = typeof settlement.amount === 'string' ? 
            parseFloat(settlement.amount) : settlement.amount;
          monthlySummary.settledByCurrentUser = true;
        }
      });
    }
    
    // Calculate net balances and settlement amounts
    monthlyMap.forEach(summary => {
      // Calculate net balance (positive means owed to user, negative means user owes)
      summary.netBalance = (
        summary.totalPaidByCurrentUser -
        (summary.equalSplitTotal / 2) -
        summary.currentUserNoSplitOwes
      ) - (
        summary.totalPaidByOtherUser -
        (summary.equalSplitTotal / 2) -
        summary.otherUserNoSplitOwes
      );
      
      // Round to 2 decimal places
      summary.netBalance = parseFloat(summary.netBalance.toFixed(2));
      
      // If not settled, add to total unsettled amount
      if (!summary.isSettled && summary.netBalance !== 0) {
        totalUnsettledAmount += Math.abs(summary.netBalance);
      }
    });
    
    // Convert Map to sorted array (newest first)
    const monthlyExpenses = Array.from(monthlyMap.values())
      .sort((a, b) => {
        // Parse month names to dates for comparison
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateB.getTime() - dateA.getTime();
      });
    
    // Format the result
    const result: BalanceData = {
      monthlyExpenses,
      totalUnsettledAmount: formatDecimal(totalUnsettledAmount)
    };
    
    // Cache the result
    setCachedData(balancesCache, result);
    
    return result;
  } catch (error) {
    logger.error('Error calculating balances:', error);
    throw error;
  }
}

/**
 * Get user settlements
 */
export async function getUserSettlements(): Promise<SettlementData> {
  try {
    // Check cache first
    const cached = getCachedData(settlementsCache);
    if (cached) return cached;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Fetch settlements
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Format settlements and ensure all required properties are non-null
    const settlements: Settlement[] = (data || []).map(s => ({
      id: s.id,
      user_id: s.user_id || user.id, // Fallback to current user if null
      month_year: s.month_year,
      amount: typeof s.amount === 'string' ? parseFloat(s.amount) : s.amount,
      status: (s.status || 'pending') as SettlementStatus,
      settled_at: s.settled_at,
      created_at: s.created_at || new Date().toISOString(),
      updated_at: s.updated_at || new Date().toISOString()
    }));
    
    // Group by month
    const settlementsByMonth: { [key: string]: Settlement[] } = {};
    
    settlements.forEach(settlement => {
      const monthYear = settlement.month_year;
      
      if (!settlementsByMonth[monthYear]) {
        settlementsByMonth[monthYear] = [];
      }
      
      settlementsByMonth[monthYear].push(settlement);
    });
    
    const result: SettlementData = { settlements, settlementsByMonth };
    
    // Cache the result
    setCachedData(settlementsCache, result);
    
    return result;
  } catch (error) {
    logger.error('Error fetching settlements:', error);
    throw error;
  }
}

/**
 * Create a new settlement
 */
export async function createSettlement(monthYear: string, amount: number): Promise<SettlementResponse> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return formatError(new Error('User not authenticated'));
    }
    
    // Check if settlement already exists
    const { data: existingSettlements } = await supabase
      .from('settlements')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', monthYear);
    
    if (existingSettlements && existingSettlements.length > 0) {
      return formatError(new Error(`A settlement for ${monthYear} already exists`));
    }
    
    // Create the settlement
    const newSettlement: SettlementCreate = {
      user_id: user.id,
      month_year: monthYear,
      amount: amount,
      status: 'completed',
      settled_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('settlements')
      .insert(newSettlement)
      .select()
      .single();
    
    if (error) {
      return formatError(error);
    }
    
    // Invalidate caches
    invalidateSettlementsCache();
    
    return formatSuccess(data, `Settlement for ${monthYear} created successfully`);
  } catch (error) {
    return formatError(error);
  }
}

/**
 * Create a partial settlement
 */
export async function createPartialSettlement(monthYear: string, amount: number): Promise<SettlementResponse> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return formatError(new Error('User not authenticated'));
    }
    
    // Check if settlement already exists
    const { data: existingSettlements } = await supabase
      .from('settlements')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', monthYear);
    
    let settlementId: string;
    let finalAmount: number = amount;
    
    if (existingSettlements && existingSettlements.length > 0) {
      // Update existing settlement
      settlementId = existingSettlements[0].id;
      
      const existingAmount = typeof existingSettlements[0].amount === 'string' ? 
        parseFloat(existingSettlements[0].amount) : existingSettlements[0].amount;
      
      finalAmount = existingAmount + amount;
      
      const { error } = await supabase
        .from('settlements')
        .update({
          amount: finalAmount,
          status: 'partial',
          updated_at: new Date().toISOString()
        })
        .eq('id', settlementId);
      
      if (error) {
        return formatError(error);
      }
    } else {
      // Create new partial settlement
      const newSettlement: SettlementCreate = {
        user_id: user.id,
        month_year: monthYear,
        amount: amount,
        status: 'partial'
      };
      
      const { data, error } = await supabase
        .from('settlements')
        .insert(newSettlement)
        .select()
        .single();
      
      if (error) {
        return formatError(error);
      }
      
      settlementId = data.id;
    }
    
    // Invalidate caches
    invalidateSettlementsCache();
    
    return formatSuccess({
      id: settlementId,
      amount: finalAmount
    }, `Partial settlement for ${monthYear} created successfully`);
  } catch (error) {
    return formatError(error);
  }
}

/**
 * Update a settlement
 */
export async function updateSettlement(update: SettlementUpdate): Promise<SettlementResponse> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return formatError(new Error('User not authenticated'));
    }
    
    // Check if settlement exists and belongs to user
    const { data: existingSettlement } = await supabase
      .from('settlements')
      .select('*')
      .eq('id', update.id)
      .eq('user_id', user.id)
      .single();
    
    if (!existingSettlement) {
      return formatError(new Error('Settlement not found or does not belong to you'));
    }
    
    // Update the settlement
    const { data, error } = await supabase
      .from('settlements')
      .update({
        ...update,
        updated_at: new Date().toISOString()
      })
      .eq('id', update.id)
      .select()
      .single();
    
    if (error) {
      return formatError(error);
    }
    
    // Invalidate caches
    invalidateSettlementsCache();
    
    return formatSuccess(data, 'Settlement updated successfully');
  } catch (error) {
    return formatError(error);
  }
}

/**
 * Delete a settlement
 */
export async function deleteSettlement(id: string): Promise<SettlementResponse> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return formatError(new Error('User not authenticated'));
    }
    
    // Check if settlement exists and belongs to user
    const { data: existingSettlement } = await supabase
      .from('settlements')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (!existingSettlement) {
      return formatError(new Error('Settlement not found or does not belong to you'));
    }
    
    // Delete the settlement
    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('id', id);
    
    if (error) {
      return formatError(error);
    }
    
    // Invalidate caches
    invalidateSettlementsCache();
    
    return formatSuccess(null, 'Settlement deleted successfully');
  } catch (error) {
    return formatError(error);
  }
}

// Helper functions

/**
 * Create an empty monthly summary
 */
function createEmptyMonthlySummary(month: string): MonthlySettlementSummary {
  return {
    month,
    expenses: [],
    total: 0,
    totalPaidByCurrentUser: 0,
    totalPaidByOtherUser: 0,
    netBalance: 0,
    equalSplitTotal: 0,
    noSplitTotal: 0,
    isSettled: false,
    settlementAmount: 0,
    settlementDate: null,
    settlementId: null,
    settledByCurrentUser: false,
    currentUserNoSplitOwes: 0,
    otherUserNoSplitOwes: 0
  };
}

/**
 * Format raw expense data for UI
 */
function formatExpenseForUI(rawExpense: any, currentUserId: string): Expense {
  return {
    id: rawExpense.id,
    amount: typeof rawExpense.amount === 'string' ? parseFloat(rawExpense.amount) : rawExpense.amount,
    date: rawExpense.date,
    notes: rawExpense.notes,
    split_type: rawExpense.split_type,
    paid_by: rawExpense.paid_by,
    category_id: rawExpense.category_id,
    location_id: rawExpense.location_id,
    created_at: rawExpense.created_at,
    updated_at: rawExpense.updated_at,
    
    // Enhanced fields from joins
    _category: rawExpense.categories?.category,
    _location: rawExpense.locations?.location,
    
    // User information
    paid_by_name: rawExpense.users?.name || rawExpense.users?.email?.split('@')[0] || 'Unknown',
    paid_by_email: rawExpense.users?.email,
    
    // Calculated fields
    isOwner: rawExpense.paid_by === currentUserId
  };
} 