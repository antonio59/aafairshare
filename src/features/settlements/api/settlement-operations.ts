import { supabase } from '../../../core/api/supabase';
import { createLogger } from '../../../core/utils/logger';
import { MONTHS, formatMonthYear, Month } from '../../../utils/date-utils';
import { cleanupTimeout, _calculateBackoffDelay, _withRetry } from '../../../utils/retry-utils';
import { parseNumber, formatDecimal, _safeSum } from '../../../utils/number-utils';
import { RealtimeChannel, User } from '@supabase/supabase-js';
import { _DbExpense, 
  DbSettlement, _DbCategory, _DbLocation, 
  DbUser, _safeCastOne, _safeCastMany, 
  handleSingleResponse, 
  handleManyResponse,
  generateSelectString, _formatErrorResponse, _formatSuccessResponse,
  createErrorHandler
} from '../../../core/utils/supabase-helpers';

// Create a logger for this module
const logger = createLogger('SettlementOps');

interface ExpenseUser extends Pick<DbUser, 'id' | 'name' | 'email'> {}

interface Expense {
  id: string;
  date: string;
  amount: number | string;
  split_type: string;
  created_at: string;
  updated_at: string;
  paid_by: string;
  category_id: string;
  location_id?: string;
  notes?: string;
  categories?: { category: string };
  locations?: { location: string };
  users?: ExpenseUser;
  category?: string;
  location?: string;
  paidByName?: string;
  isPaidByCurrentUser?: boolean;
  splitAmount?: string;
  formattedAmount?: string;
  splitType?: string;
}

interface MonthlyExpense {
  month: string;
  expenses: Expense[];
  total: number;
  totalPaidByCurrentUser: number;
  totalPaidByOtherUser: number;
  equalSplitTotal: number;
  noSplitTotal: number;
  isSettled: boolean;
  settlementAmount: number;
  settlementDate: string | null;
  settlementId: string | null;
  settledByCurrentUser: boolean;
  netBalance: number;
  currentUserNoSplitOwes: number;
  otherUserNoSplitOwes: number;
}

type SettlementWithStatus = DbSettlement & {
  status: 'completed' | 'pending';
};

interface BalanceResult {
  monthlyExpenses: MonthlyExpense[];
  totalUnsettledAmount: string;
}

interface Settlement extends DbSettlement {
  status: 'completed' | 'pending';
  currency?: string;
}

interface ExpenseChangePayload {
  type?: 'MANUAL_REFRESH';
  eventType?: string;
}

// Cache implementation
interface Cache<T> {
  data: T | null;
  timestamp: number;
  expiresAt: number;
}

// Global cache objects with 5-minute TTL (300000ms)
const CACHE_TTL = 300000;
const balancesCache: Cache<BalanceResult> = { data: null, timestamp: 0, expiresAt: 0 };
const settlementsCache: Cache<{settlements: Settlement[], settlementsByMonth: { [key: string]: Settlement[] }}> = 
  { data: null, timestamp: 0, expiresAt: 0 };

// Cache helper functions
function getCachedData<T>(cache: Cache<T>): T | null {
  const now = Date.now();
  if (cache.data && now < cache.expiresAt) {
    logger.info('Using cached data from', new Date(cache.timestamp).toISOString());
    return cache.data;
  }
  return null;
}

function setCachedData<T>(cache: Cache<T>, data: T): void {
  const now = Date.now();
  cache.data = data;
  cache.timestamp = now;
  cache.expiresAt = now + CACHE_TTL;
  logger.info('Updated cache at', new Date(now).toISOString());
}

function invalidateCache(cache: Cache<any>): void {
  cache.data = null;
  cache.timestamp = 0;
  cache.expiresAt = 0;
  logger.info('Cache invalidated');
}

const _handleSettlementError = createErrorHandler(logger, 'settlementOperations');

function getUserDisplayName(_user: User): string {
  if (!_user) return 'Unknown User';
  
  const name = _user.user_metadata?.name || _user.email?.split('@')[0] || 'User';
  return name;
}

function generateExpenseSelectQuery(includeJoins = true): string {
  if (!includeJoins) return '*';
  
  return generateSelectString('*', {
    'users': { foreignKey: 'paid_by', fields: ['id', 'name', 'email'] },
    'categories': { foreignKey: 'category_id', fields: ['id', 'category'] },
    'locations': { foreignKey: 'location_id', fields: ['id', 'location'] }
  });
}

export async function setupExpenseSubscription(
  onExpenseChange: (payload: ExpenseChangePayload) => Promise<void>
): Promise<() => void> {
  try {
    const { data: { _user } } = await supabase.auth.getUser();
    if (!_user) {
      logger.warn('No _user found for subscription');
      return () => {};
    }

    const channelName = `expenses-changes-${user as _user.id}-${Date.now()}`;
    let channel: RealtimeChannel | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let isActive = true;

    const setupChannel = async () => {
      if (!isActive) return;
      
      cleanupTimeout({ retryTimeout }, 'retryTimeout');
      
      if (channel) {
        try {
          await channel.unsubscribe();
        } catch (e) {
          logger.error('Error cleaning up existing channel:', e);
        }
      }
      
      channel = supabase.channel(channelName);
      
      try {
        if (!channel) {
          throw new Error('Failed to create Supabase channel');
        }
        
        await channel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'expenses'
          }, async (payload) => {
            if (!isActive) return;
            logger.info('Expense change detected:', payload.eventType);
            
            if (!payload || !onExpenseChange) return;
            
            try {
              // Invalidate caches on any data change
              invalidateCache(balancesCache);
              await onExpenseChange(payload);
            } catch (error) {
              logger.error('Error handling expense change:', error);
              if (isActive) {
                await onExpenseChange({ type: 'MANUAL_REFRESH' });
              }
            }
          })
          .subscribe(async (status) => {
            if (!isActive) return;
            
            logger.info('Subscription status changed:', status);
            
            if (status === 'SUBSCRIBED') {
              logger.info('Successfully subscribed to expense changes');
              if (onExpenseChange && isActive) {
                await onExpenseChange({ type: 'MANUAL_REFRESH' });
              }
            } else if (status === 'CLOSED' && isActive) {
              logger.warn('Subscription closed unexpectedly, retrying...');
              retryTimeout = setTimeout(() => {
                if (isActive) {
                  setupChannel();
                }
              }, 1000);
            }
          });
      } catch (error) {
        logger.error('Error in channel setup:', error);
        if (isActive) {
          retryTimeout = setTimeout(setupChannel, 1000);
        }
      }
    };
    
    await setupChannel();
    
    return () => {
      logger.info('Cleaning up subscription');
      isActive = false;
      cleanupTimeout({ retryTimeout }, 'retryTimeout');
      
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (e) {
          logger.error('Error during subscription cleanup', e);
        }
      }
    };
  } catch (error) {
    logger.error('Subscription setup error', error);
    return () => {};
  }
}

function _isValidMonth(month: string): month is Month {
  return MONTHS.includes(month as Month);
}

// Optimize calculation with filtering by date range and pagination
export async function calculateUserBalances(
  options: { 
    forceRefresh?: boolean; 
    startDate?: string; 
    endDate?: string;
    limit?: number;
    page?: number;
  } = {}
): Promise<BalanceResult> {
  const { forceRefresh = false, startDate, endDate, limit = 500, page = 0 } = options;
  
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedData(balancesCache);
      if (cachedData) {
        return cachedData;
      }
    }
    
    const { data: { _user } } = await supabase.auth.getUser();
    if (!_user) throw new Error('No authenticated _user found');
    
    logger.info('calculateUserBalances: Starting calculation for user:', user.id, {
      forceRefresh, startDate, endDate, limit, page
    });
    
    // Build query with filters and pagination
    let query = supabase
      .from('expenses')
      .select(generateExpenseSelectQuery());
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Apply pagination and ordering
    query = query
      .order('date', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
      
    // Execute query
    const response = await query;
    
    if (response.error) {
      throw response.error;
    }
    
    const expenses = handleManyResponse<Expense>(response);
    logger.info(`Fetched ${expenses.length} expenses`);
    
    const expensesByMonth: { [key: string]: MonthlyExpense } = {};
    let totalUnsettledAmount = 0;

    expenses.forEach((expense: Expense) => {
      const amount = parseNumber(expense.amount);
      
      const monthYear = formatMonthYear(expense.date);
      
      if (!expensesByMonth[monthYear]) {
        expensesByMonth[monthYear] = {
          month: monthYear,
          expenses: [],
          total: 0,
          totalPaidByCurrentUser: 0,
          totalPaidByOtherUser: 0,
          equalSplitTotal: 0,
          noSplitTotal: 0,
          isSettled: false,
          settlementAmount: 0,
          settlementDate: null,
          settlementId: null,
          settledByCurrentUser: false,
          netBalance: 0,
          currentUserNoSplitOwes: 0,
          otherUserNoSplitOwes: 0,
        };
      }

      const isCurrentUserPayer = expense.users?.id === user.id;
      if (isCurrentUserPayer) {
        expensesByMonth[monthYear].totalPaidByCurrentUser += amount;
      } else {
        expensesByMonth[monthYear].totalPaidByOtherUser += amount;
      }
      
      expensesByMonth[monthYear].total += amount;
      totalUnsettledAmount += amount;

      if (expense.split_type === 'equal') {
        expensesByMonth[monthYear].equalSplitTotal += amount;
      } else {
        expensesByMonth[monthYear].noSplitTotal += amount;
        
        if (isCurrentUserPayer) {
          expensesByMonth[monthYear].otherUserNoSplitOwes += amount;
        } else {
          expensesByMonth[monthYear].currentUserNoSplitOwes += amount;
        }
      }

      expensesByMonth[monthYear].expenses.push({
        ...expense,
        amount: amount,
        formattedAmount: formatDecimal(amount),
        category: expense.categories?.category,
        location: expense.locations?.location,
        paidByName: expense.users?.name || getUserDisplayName(_user),
        isPaidByCurrentUser: isCurrentUserPayer,
        splitAmount: formatDecimal(expense.split_type === 'equal' ? amount / 2 : amount),
        splitType: expense.split_type
      });
    });
    
    // Calculate balances
    Object.values(expensesByMonth).forEach(month => {
      const equalSplitPerUser = month.equalSplitTotal / 2;
      const equalSplitBalance = month.totalPaidByCurrentUser - equalSplitPerUser;
      const noSplitBalance = month.otherUserNoSplitOwes - month.currentUserNoSplitOwes;
      month.netBalance = equalSplitBalance + noSplitBalance;
    });

    // Sort monthly expenses
    const monthlyExpenses = Object.values(expensesByMonth)
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split(' ');
        const [monthB, yearB] = b.month.split(' ');
        
        const yearNumA = parseInt(yearA, 10);
        const yearNumB = parseInt(yearB, 10);
        
        if (yearNumA !== yearNumB) {
          return yearNumB - yearNumA;
        }
        
        const monthIndexA = MONTHS.findIndex((m: string) => m === monthA);
        const monthIndexB = MONTHS.findIndex((m: string) => m === monthB);
        
        if (monthIndexA === -1 || monthIndexB === -1) {
          logger.error('Invalid month found in comparison', { monthA, monthB });
          return 0;
        }
        
        return monthIndexB - monthIndexA;
      });

    logger.info('calculateUserBalances: Processed monthly expenses:', {
      totalMonths: monthlyExpenses.length,
      months: monthlyExpenses.map(m => m.month),
      totalExpenses: monthlyExpenses.reduce((sum: number, m: MonthlyExpense) => sum + m.expenses.length, 0)
    });
    
    const result = {
      monthlyExpenses,
      totalUnsettledAmount: formatDecimal(totalUnsettledAmount)
    };
    
    // Cache the result
    setCachedData(balancesCache, result);
    
    return result;
  } catch (error) {
    logger.error('Error calculating _user balances:', error);
    throw error;
  }
}

// Other functions with caching

export async function createSettlement(
  monthYear: string,
  amount: number,
  currency: string = 'GBP'
): Promise<Settlement> {
  try {
    const _user = await getAuthenticatedUser();
    
    // Construct settlement data using DB type
    const settlementData: Omit<DbSettlement, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user as _user.id,
      month_year: monthYear,
      amount,
      status: 'pending'
    };
    
    // Insert settlement using safe type handling
    const response = await supabase
      .from('settlements')
      .insert(settlementData)
      .select()
      .single();
    
    // Use our utility function to safely handle the response
    const settlement = handleSingleResponse<DbSettlement>(response);
    if (!settlement) throw new Error('Failed to create settlement');
    
    // Invalidate caches on data change
    invalidateCache(balancesCache);
    invalidateCache(settlementsCache);
    
    // Return with proper type conversion
    return {
      ...settlement,
      status: 'pending' as const,
      currency
    };
  } catch (error) {
    logger.error('Error creating settlement:', error);
    throw new Error(`Failed to create settlement: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUserSettlements(): Promise<{
  settlements: Settlement[];
  settlementsByMonth: { [key: string]: Settlement[] };
}> {
  try {
    // Check cache first
    const cachedData = getCachedData(settlementsCache);
    if (cachedData) {
      return cachedData;
    }
    
    const { data: { _user } } = await supabase.auth.getUser();
    if (!_user) throw new Error('User not authenticated');
    
    const response = await supabase
      .from('settlements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (response.error) {
      throw response.error;
    }
    
    const settlements = handleManyResponse<Settlement>(response);
    
    const settlementsByMonth = settlements.reduce<{ [key: string]: Settlement[] }>(
      (acc, settlement) => {
        const month = settlement.month_year;
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(settlement);
        return acc;
      },
      {}
    );
    
    const result = { settlements, settlementsByMonth };
    
    // Cache the result
    setCachedData(settlementsCache, result);
    
    return result;
  } catch (error) {
    logger.error('Error getting _user settlements:', error);
    return { settlements: [], settlementsByMonth: {} };
  }
}

export async function markSettlementComplete(settlementId: string): Promise<Settlement> {
  try {
    // Use our getAuthenticatedUser helper
    const _user = await getAuthenticatedUser();
    
    // Update the settlement status
    const updateData = {
      status: 'completed',
      updated_at: new Date().toISOString()
    };
    
    // Use our utility functions for the update
    const response = await supabase
      .from('settlements')
      .update(updateData)
      .eq('id', settlementId)
      .select()
      .single();
    
    // Use our utility function to safely handle the response
    const settlement = handleSingleResponse<DbSettlement>(response);
    if (!settlement) throw new Error('Failed to update settlement');
    
    // Invalidate caches on data change
    invalidateCache(balancesCache);
    invalidateCache(settlementsCache);
    
    // Return with proper type conversion
    return {
      ...settlement,
      status: 'completed' as const
    };
  } catch (error) {
    logger.error('Error marking settlement complete:', error);
    throw new Error(`Failed to mark settlement complete: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getAuthenticatedUser(): Promise<User> {
  const { data: { _user } } = await supabase.auth.getUser();
  if (!_user) throw new Error('User not authenticated');
  return user;
} 