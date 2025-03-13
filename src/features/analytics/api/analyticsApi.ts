import { supabase } from '../../../core/api/supabase';
import { createLogger } from '../../../core/utils/logger';
import { getExpenseAnalytics } from '../../expenses/api/expenseApi';
import { 
  AnalyticsResponse, 
  DateRangeOption, 
  BudgetStatus,
  CategoryData,
  LocationData,
  TimeData,
  DailyTrendData
} from '../types';
import { getUserBudget } from './budgetApi';
import { ApiResponse } from '../../../core/types/expenses';

// Create a logger for this module
const logger = createLogger('analyticsApi');

// Cache for analytics data
const analyticsCache: Record<string, { timestamp: number; data: any }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches expense analytics data for the current user for a specific date range
 * 
 * @param dateRange - The range of dates to analyze ('month', 'quarter', 'year', 'custom')
 * @param startDate - Optional start date for custom range (ISO format)
 * @param endDate - Optional end date for custom range (ISO format)
 * @returns Promise with analytics data
 */
export async function fetchExpenseAnalytics(
  dateRange: DateRangeOption = 'month',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<AnalyticsResponse>> {
  try {
    // Generate a cache key based on parameters
    const cacheKey = `analytics_${dateRange}_${startDate || ''}_${endDate || ''}`;
    
    // Check cache first
    const cachedData = analyticsCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
      logger.info('Returning cached analytics data');
      return {
        success: true,
        data: cachedData.data,
        message: 'Analytics data retrieved from cache'
      };
    }
    
    // Fetch fresh data from the API
    const response = await getExpenseAnalytics(dateRange, startDate, endDate);
    
    if (!response.success || !response.data) {
      return response as ApiResponse<AnalyticsResponse>;
    }
    
    // Cache the successful response
    analyticsCache[cacheKey] = {
      timestamp: Date.now(),
      data: response.data
    };
    
    return response as ApiResponse<AnalyticsResponse>;
  } catch (error) {
    logger.error('Error fetching expense analytics:', error);
    return {
      success: false,
      message: `Error fetching analytics: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Calculates the user's budget status based on current spending and budget target
 * 
 * @param currentSpending - The current amount spent
 * @returns Promise with budget status information
 */
export async function calculateBudgetStatus(): Promise<ApiResponse<BudgetStatus>> {
  try {
    // First, get the user's current spending for this month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDay}`;
    
    const analytics = await fetchExpenseAnalytics('month', startDate, endDate);
    
    if (!analytics.success || !analytics.data) {
      return {
        success: false,
        message: analytics.message || 'Failed to fetch current spending'
      };
    }
    
    const currentSpending = analytics.data.totalSpent;
    
    // Next, get the user's budget target
    const budgetSettings = await getUserBudget();
    
    if (!budgetSettings) {
      return {
        success: false,
        message: 'No budget settings found'
      };
    }
    
    const target = budgetSettings.monthly_target;
    
    // Calculate budget status
    let status: 'on_track' | 'warning' | 'at_risk' = 'on_track';
    
    // Use percentage of month passed to determine if on track
    const dayOfMonth = now.getDate();
    const daysInMonth = lastDay;
    const monthProgress = dayOfMonth / daysInMonth;
    const budgetProgress = currentSpending / target;
    
    if (budgetProgress > 0.9) {
      status = 'at_risk';
    } else if (budgetProgress > monthProgress + 0.1) {
      status = 'warning';
    }
    
    const budgetStatus: BudgetStatus = {
      current: currentSpending,
      target,
      status
    };
    
    return {
      success: true,
      data: budgetStatus,
      message: 'Budget status calculated successfully'
    };
  } catch (error) {
    logger.error('Error calculating budget status:', error);
    return {
      success: false,
      message: `Error calculating budget status: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Clears the analytics cache, forcing fresh data to be fetched on next request
 */
export function clearAnalyticsCache(): void {
  Object.keys(analyticsCache).forEach(key => {
    delete analyticsCache[key];
  });
  logger.info('Analytics cache cleared');
}

/**
 * Gets the top spending categories for the specified period
 * 
 * @param limit The number of top categories to return
 * @param dateRange The date range to analyze
 * @returns Promise with the top spending categories
 */
export async function getTopSpendingCategories(
  limit: number = 5,
  dateRange: DateRangeOption = 'month'
): Promise<ApiResponse<CategoryData[]>> {
  try {
    const analytics = await fetchExpenseAnalytics(dateRange);
    
    if (!analytics.success || !analytics.data) {
      return {
        success: false,
        message: analytics.message || 'Failed to fetch category data'
      };
    }
    
    // Sort categories by amount (descending) and take the top n
    const topCategories = [...analytics.data.categoryDistribution]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
      
    return {
      success: true,
      data: topCategories,
      message: 'Top spending categories retrieved successfully'
    };
  } catch (error) {
    logger.error('Error getting top spending categories:', error);
    return {
      success: false,
      message: `Error getting top categories: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Gets the top spending locations for the specified period
 * 
 * @param limit The number of top locations to return
 * @param dateRange The date range to analyze
 * @returns Promise with the top spending locations
 */
export async function getTopSpendingLocations(
  limit: number = 5,
  dateRange: DateRangeOption = 'month'
): Promise<ApiResponse<LocationData[]>> {
  try {
    const analytics = await fetchExpenseAnalytics(dateRange);
    
    if (!analytics.success || !analytics.data) {
      return {
        success: false,
        message: analytics.message || 'Failed to fetch location data'
      };
    }
    
    // Sort locations by amount (descending) and take the top n
    const topLocations = [...analytics.data.locationDistribution]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
      
    return {
      success: true,
      data: topLocations,
      message: 'Top spending locations retrieved successfully'
    };
  } catch (error) {
    logger.error('Error getting top spending locations:', error);
    return {
      success: false,
      message: `Error getting top locations: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Analyzes spending trends over the specified period
 * 
 * @param dateRange The date range to analyze
 * @returns Promise with spending trend data
 */
export async function getSpendingTrends(
  dateRange: DateRangeOption = 'month'
): Promise<ApiResponse<DailyTrendData[]>> {
  try {
    const analytics = await fetchExpenseAnalytics(dateRange);
    
    if (!analytics.success || !analytics.data) {
      return {
        success: false,
        message: analytics.message || 'Failed to fetch trend data'
      };
    }
    
    return {
      success: true,
      data: analytics.data.dailyTrend,
      message: 'Spending trends retrieved successfully'
    };
  } catch (error) {
    logger.error('Error getting spending trends:', error);
    return {
      success: false,
      message: `Error getting trends: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 