// Expense operations - Core utility functions for expense management

import { supabase } from '../../../core/api/supabase';
import { createLogger } from '../../../core/utils/logger';
import { Database } from '../../../core/types/supabase.types';
import {
  Expense,
  ExpenseCreate,
  ExpenseUpdate
} from '../../../core/types/expenses';
import { invalidateQueries } from '../../../core/utils/query-cache';

// Create a logger for this module
const logger = createLogger('expenseApi');

// Define types based on the Supabase schema
type DbExpense = Database['public']['Tables']['expenses']['Row'];
type DbExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type DbExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
type DbUser = Database['public']['Tables']['users']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbLocation = Database['public']['Tables']['locations']['Row'];

// Type for API response
interface ApiErrorResponse {
  error: string;
  details?: unknown;
  status?: number;
}

// Function to check if string is valid ISO date
function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

// Function to parse UK format date (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
function parseUKDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // If it's already in ISO format, return it
  if (isValidISODate(dateStr)) {
    return dateStr;
  }
  
  try {
    // Parse UK format
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      logger.warn('Invalid date format, expected DD/MM/YYYY:', dateStr);
      return dateStr; // Return as-is if not UK format
    }
    
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    logger.error('Error parsing date:', error);
    return dateStr; // Return as-is in case of error
  }
}

// In-memory cache for expenses
interface CachedExpense {
  data: Expense[];
  timestamp: number;
}

let expensesCache: Record<string, CachedExpense> = {};

/**
 * Clear the expenses cache
 * Forces a fresh fetch on next call to getExpenses
 */
export function invalidateExpensesCache(): void {
  logger.info('Invalidating expenses cache');
  expensesCache = {};
  // Also invalidate any related queries
  invalidateQueries(['expenses']);
}

/**
 * Create a new expense
 * 
 * @param expenseData - The expense data to create
 * @param csrfToken - Optional CSRF token for security
 * @returns Promise with the created expense or error
 */
export async function createExpense(
  expenseData: ExpenseCreate,
  csrfToken?: string
): Promise<ApiResponse<Expense>> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    // Process date input - ensure it's in ISO format
    const date = parseUKDate(expenseData.date);
    
    // Validate the date
    if (!isValidISODate(date)) {
      return {
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY',
      };
    }
    
    // Handle category logic
    let categoryId = expenseData.category_id;
    if (expenseData.category && !categoryId) {
      // If category name is provided but no ID, try to find or create it
      const { data: categories } = await supabase
        .from('categories')
        .select('id, category')
        .eq('category', expenseData.category)
        .limit(1);
        
      if (categories && categories.length > 0) {
        // Use existing category
        categoryId = categories[0].id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({ category: expenseData.category })
          .select()
          .single();
          
        if (categoryError) {
          logger.error('Error creating category:', categoryError);
          return {
            success: false,
            message: `Error creating category: ${categoryError.message}`,
          };
        }
        
        categoryId = newCategory.id;
      }
    }
    
    // Handle location logic - primary location only
    let locationId = expenseData.location_id;
    
    // Handle a single location (location field)
    if (expenseData.location && !locationId) {
      const { data: locations } = await supabase
        .from('locations')
        .select('id, location')
        .eq('location', expenseData.location)
        .single();
    
      if (locations) {
        // Use existing location
        locationId = locations.id;
      } else {
        // Create new location
        const { data: newLocation, error: locationError } = await supabase
          .from('locations')
          .insert({ location: expenseData.location })
          .select()
          .single();
    
        if (locationError) {
          logger.error('Error creating location:', locationError);
          return {
            success: false,
            message: `Error creating location: ${locationError.message}`,
          };
        }
    
        locationId = newLocation.id;
      }
    }

    // Prepare expense data for insertion/update
    const expenseToSave = {
      ...validExpenseData,
      location_id: locationId || null,
    };

    // Create the expense record with required fields
    const expenseToCreate: DbExpenseInsert = {
      amount: expenseData.amount,
      date: date,
      paid_by: user.id,
      category_id: categoryId || null,
      notes: expenseData.notes || '',
      location_id: locationId || null,
      split_type: expenseData.split_type || 'equal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    logger.info('Creating expense with data:', { expenseToCreate });

    // Add CSRF header if provided
    const headers: Record<string, string> = {};
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(expenseToCreate)
      .select(`
        *,
        categories(id, category),
        locations(id, location),
        users(id, email, name)
      `)
      .single();

    if (error) {
      logger.error('Error creating expense:', error);
      return {
        success: false,
        message: `Error creating expense: ${error.message}`,
      };
    }

    if (!expense) {
      logger.error('No expense returned after creation');
      return {
        success: false,
        message: 'Failed to create expense: No data returned',
      };
    }

    // If we have multiple locations, add them to the junction table
    if (locationIds.length > 1) {
      const expenseLocationsToInsert = locationIds.map(locId => ({
        expense_id: expense.id,
        location_id: locId
      }));
      
      // Insert into the junction table
      const { error: junctionError } = await supabase
        .from('expense_locations')
        .insert(expenseLocationsToInsert);
        
      if (junctionError) {
        logger.error('Error inserting multiple locations:', junctionError);
        // Continue with the expense creation even if this fails
      }
    }

    // Format the expense for the frontend
    const formattedExpense: Expense = {
      id: expense.id,
      amount: expense.amount,
      date: expense.date,
      notes: expense.notes || null,
      split_type: expense.split_type,
      paid_by: expense.paid_by,
      category_id: expense.category_id || null,
      location_id: expense.location_id || null,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      // Add derived fields for convenience
      _category: expense.categories?.category,
      _location: expense.locations?.location,
      paid_by_name: expense.users?.name || expense.users?.email,
      isOwner: expense.paid_by === user.id,
    };

    // Invalidate cache after successful creation
    invalidateExpensesCache();

    return {
      success: true,
      data: formattedExpense,
      message: 'Expense created successfully',
    };
  } catch (error) {
    logger.error('Error in createExpense:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred creating the expense',
    };
  }
}

/**
 * Update an existing expense
 * 
 * @param expenseId - The ID of the expense to update
 * @param expenseData - The updated expense data
 * @param csrfToken - Optional CSRF token for security
 * @returns Promise with the update result
 */
export async function updateExpense(
  expenseId: string,
  expenseData: Partial<ExpenseUpdate>,
  csrfToken?: string
): Promise<ApiResponse<Expense>> {
  try {
    // Validate expense ID
    if (!expenseId || typeof expenseId !== 'string') {
      return {
        success: false,
        message: 'Invalid expense ID',
      };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    // Filter out properties that don't exist in the database schema
    const { 
      _category, _location, _currency, _description, 
      locations, all_locations, category, location,
      ...validExpenseData 
    } = expenseData as any;

    logger.info(`Updating expense with ID ${expenseId}`, validExpenseData);

    // Process date if provided
    if (validExpenseData.date) {
      validExpenseData.date = parseUKDate(validExpenseData.date);
      
      // Validate the date
      if (!isValidISODate(validExpenseData.date)) {
        return {
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY',
        };
      }
    }
    
    // Handle category logic if provided
    if (category && !validExpenseData.category_id) {
      // Try to find or create the category
      const { data: categories } = await supabase
        .from('categories')
        .select('id, category')
        .eq('category', category)
        .limit(1);
        
      if (categories && categories.length > 0) {
        // Use existing category
        validExpenseData.category_id = categories[0].id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({ category })
          .select()
          .single();
          
        if (categoryError) {
          logger.error('Error creating category during update:', categoryError);
          return {
            success: false,
            message: `Error creating category: ${categoryError.message}`,
          };
        }
        
        validExpenseData.category_id = newCategory.id;
      }
    }
    
    // Handle location logic if provided
    if (location && !validExpenseData.location_id) {
      // Try to find or create the location
      const { data: locations } = await supabase
        .from('locations')
        .select('id, location')
        .eq('location', location)
        .limit(1);
        
      if (locations && locations.length > 0) {
        // Use existing location
        validExpenseData.location_id = locations[0].id;
      } else {
        // Create new location
        const { data: newLocation, error: locationError } = await supabase
          .from('locations')
          .insert({ location })
          .select()
          .single();
          
        if (locationError) {
          logger.error('Error creating location during update:', locationError);
          return {
            success: false,
            message: `Error creating location: ${locationError.message}`,
          };
        }
        
        validExpenseData.location_id = newLocation.id;
      }
    }

    // Add updated_at timestamp
    validExpenseData.updated_at = new Date().toISOString();

    // Add CSRF header if provided
    const headers: Record<string, string> = {};
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    // First, check if the expense exists and if user has permission
    const { data: existingExpense, error: fetchError } = await supabase
      .from('expenses')
      .select('id, paid_by')
      .eq('id', expenseId)
      .single();
      
    if (fetchError) {
      logger.error('Error fetching expense for update:', fetchError);
      return {
        success: false,
        message: `Error fetching expense: ${fetchError.message}`,
      };
    }
    
    if (!existingExpense) {
      return {
        success: false,
        message: 'Expense not found',
      };
    }
    
    // Check if user owns the expense
    if (existingExpense.paid_by !== user.id) {
      return {
        success: false,
        message: 'You can only update expenses you created',
      };
    }

    // Perform the update
    const { data: updatedExpense, error } = await supabase
      .from('expenses')
      .update(validExpenseData)
      .eq('id', expenseId)
      .select(`
        *,
        categories(id, category),
        locations(id, location),
        users(id, email, name)
      `)
      .single();

    if (error) {
      logger.error('Error updating expense:', error);
      return {
        success: false,
        message: `Error updating expense: ${error.message}`,
      };
    }
    
    if (!updatedExpense) {
      logger.error('No expense returned after update');
      return {
        success: false,
        message: 'Failed to update expense: No data returned',
      };
    }

    // Handle multiple locations if provided
    if (locations && Array.isArray(locations)) {
      // First, delete all existing associations
      const { error: deleteError } = await supabase
        .from('expense_locations')
        .delete()
        .eq('expense_id', expenseId);
        
      if (deleteError) {
        logger.error('Error deleting expense locations:', deleteError);
        // Continue despite error
      }
      
      // Get or create location IDs for each location
      const locationIds: string[] = [];
      for (const loc of locations) {
        // Find or create location
        const { data: existingLocs } = await supabase
          .from('locations')
          .select('id')
          .eq('location', loc)
          .limit(1);
          
        if (existingLocs && existingLocs.length > 0) {
          locationIds.push(existingLocs[0].id);
        } else {
          // Create new location
          const { data: newLoc, error: newLocError } = await supabase
            .from('locations')
            .insert({ location: loc })
            .select()
            .single();
            
          if (newLocError) {
            logger.error(`Error creating location "${loc}":`, newLocError);
            continue;
          }
          
          locationIds.push(newLoc.id);
        }
      }
      
      // Insert all associations
      if (locationIds.length > 0) {
        const expenseLocations = locationIds.map(locId => ({
          expense_id: expenseId,
          location_id: locId
        }));
        
        const { error: insertError } = await supabase
          .from('expense_locations')
          .insert(expenseLocations);
          
        if (insertError) {
          logger.error('Error inserting expense locations:', insertError);
          // Continue despite error
        }
      }
    }

    // Format the expense for the frontend
    const formattedExpense: Expense = {
      id: updatedExpense.id,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      notes: updatedExpense.notes || null,
      split_type: updatedExpense.split_type,
      paid_by: updatedExpense.paid_by,
      category_id: updatedExpense.category_id || null,
      location_id: updatedExpense.location_id || null,
      created_at: updatedExpense.created_at,
      updated_at: updatedExpense.updated_at,
      // Add derived fields for convenience
      _category: updatedExpense.categories?.category,
      _location: updatedExpense.locations?.location,
      paid_by_name: updatedExpense.users?.name || updatedExpense.users?.email,
      isOwner: updatedExpense.paid_by === user.id,
    };

    // Invalidate cache after successful update
    invalidateExpensesCache();

    return {
      success: true,
      data: formattedExpense,
      message: 'Expense updated successfully',
    };
  } catch (error) {
    logger.error('Error in updateExpense:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred updating the expense',
    };
  }
}

/**
 * Get details of a specific expense
 * 
 * @param expenseId - The ID of the expense to get
 * @returns Promise with the expense details or error
 */
export async function getExpenseDetails(expenseId: string): Promise<ApiResponse<Expense>> {
  try {
    // Validate expense ID
    if (!expenseId || typeof expenseId !== 'string') {
      return {
        success: false,
        message: 'Invalid expense ID',
      };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    logger.info(`Fetching expense details for ID ${expenseId}`);

    // Check cache first
    const cacheKey = `expense_${expenseId}`;
    if (expensesCache[cacheKey]) {
      logger.info(`Using cached data for expense ${expenseId}`);
      return {
        success: true,
        data: expensesCache[cacheKey],
        message: 'Expense details retrieved from cache',
      };
    }

    // Fetch from database with related data
    const { data: expense, error } = await supabase
      .from('expenses')
      .select(`
        *,
        categories(id, category),
        locations(id, location),
        users:paid_by(id, email, name)
      `)
      .eq('id', expenseId)
      .single();
      
    if (error) {
      logger.error('Error fetching expense details:', error);
      return {
        success: false,
        message: `Error fetching expense details: ${error.message}`,
      };
    }
    
    if (!expense) {
      return {
        success: false,
        message: 'Expense not found',
      };
    }

    // Also fetch any additional locations
    const { data: additionalLocations, error: locError } = await supabase
      .from('expense_locations')
      .select(`
        locations(id, location)
      `)
      .eq('expense_id', expenseId);
      
    if (locError) {
      logger.error('Error fetching additional locations:', locError);
      // Continue despite error
    }

    // Format the expense for the frontend
    const formattedExpense: Expense = {
      id: expense.id,
      amount: expense.amount,
      date: expense.date,
      notes: expense.notes || null,
      split_type: expense.split_type,
      paid_by: expense.paid_by,
      category_id: expense.category_id || null,
      location_id: expense.location_id || null,
      created_at: expense.created_at,
      updated_at: expense.updated_at,
      // Add derived fields for convenience
      _category: expense.categories?.category,
      _location: expense.locations?.location,
      paid_by_name: expense.users?.name || expense.users?.email,
      isOwner: expense.paid_by === user.id,
      // Add any additional locations
      _all_locations: additionalLocations 
        ? additionalLocations.map(item => item.locations.location) 
        : []
    };

    // Cache the result
    expensesCache[cacheKey] = formattedExpense;

    return {
      success: true,
      data: formattedExpense,
      message: 'Expense details retrieved successfully',
    };
  } catch (error) {
    logger.error('Error in getExpenseDetails:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred retrieving expense details',
    };
  }
}

/**
 * Delete an expense
 * 
 * @param expenseId - The ID of the expense to delete
 * @returns Promise with the result of the operation
 */
export async function deleteExpense(expenseId: string): Promise<ApiResponse<null>> {
  try {
    // Validate expense ID
    if (!expenseId || typeof expenseId !== 'string') {
      return {
        success: false,
        message: 'Invalid expense ID',
      };
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    logger.info(`Attempting to delete expense ${expenseId}`);

    // First, check if the expense exists and if user has permission
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('id, paid_by')
      .eq('id', expenseId)
      .single();
      
    if (fetchError) {
      logger.error('Error fetching expense for deletion:', fetchError);
      return {
        success: false,
        message: `Error fetching expense: ${fetchError.message}`,
      };
    }
    
    if (!expense) {
      return {
        success: false,
        message: 'Expense not found',
      };
    }
    
    // Check if user owns the expense
    if (expense.paid_by !== user.id) {
      return {
        success: false,
        message: 'You can only delete expenses you created',
      };
    }

    // First delete any expense_locations records
    const { error: deleteLocError } = await supabase
      .from('expense_locations')
      .delete()
      .eq('expense_id', expenseId);
      
    if (deleteLocError) {
      logger.error('Error deleting expense locations:', deleteLocError);
      // Continue despite error
    }

    // Now delete the expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);
      
    if (error) {
      logger.error('Error deleting expense:', error);
      return {
        success: false,
        message: `Error deleting expense: ${error.message}`,
      };
    }

    // Clear from cache
    const cacheKey = `expense_${expenseId}`;
    if (expensesCache[cacheKey]) {
      delete expensesCache[cacheKey];
    }
    
    // Also invalidate any other cached data that might include this expense
    invalidateExpensesCache();

    return {
      success: true,
      message: 'Expense deleted successfully',
      data: null,
    };
  } catch (error) {
    logger.error('Error in deleteExpense:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred deleting the expense',
    };
  }
}

/**
 * Get expense analytics data for a specific date range
 * 
 * @param dateRange - The date range to get analytics for (e.g., 'month', 'quarter', 'year')
 * @param startDate - The start date of the range (ISO format)
 * @param endDate - The end date of the range (ISO format)
 * @returns Promise with the analytics data or error
 */
export async function getExpenseAnalytics(
  dateRange: 'month' | 'quarter' | 'year' | 'custom' = 'month',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<any>> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      };
    }

    // Calculate date range if not provided
    let finalStartDate = startDate;
    let finalEndDate = endDate;
    
    if (!finalStartDate || !finalEndDate) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      if (dateRange === 'month') {
        // Current month
        finalStartDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        finalEndDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDay}`;
      } else if (dateRange === 'quarter') {
        // Current quarter
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        finalStartDate = `${currentYear}-${String(quarterStartMonth + 1).padStart(2, '0')}-01`;
        const quarterEndMonth = quarterStartMonth + 2;
        const lastDay = new Date(currentYear, quarterEndMonth + 1, 0).getDate();
        finalEndDate = `${currentYear}-${String(quarterEndMonth + 1).padStart(2, '0')}-${lastDay}`;
      } else if (dateRange === 'year') {
        // Current year
        finalStartDate = `${currentYear}-01-01`;
        finalEndDate = `${currentYear}-12-31`;
      }
    }

    // Validate dates
    if (!finalStartDate || !finalEndDate || !isValidISODate(finalStartDate) || !isValidISODate(finalEndDate)) {
      return {
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      };
    }

    // Query expenses for the date range
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        id, 
        amount, 
        date, 
        notes,
        categories(id, category),
        locations(id, location),
        users!paid_by(id, name, email)
      `)
      .eq('paid_by', user.id)
      .gte('date', finalStartDate)
      .lte('date', finalEndDate)
      .order('date', { ascending: false });

    if (error) {
      logger.error('Error fetching expenses for analytics:', error);
      return {
        success: false,
        message: `Error fetching expenses: ${error.message}`,
      };
    }

    if (!expenses || expenses.length === 0) {
      return {
        success: true,
        data: {
          categoryDistribution: [],
          locationDistribution: [],
          dailyTrend: [],
          timeDistribution: [],
          totalSpent: 0,
          count: 0
        },
        message: 'No expenses found for the selected period',
      };
    }

    // Process expenses for analytics
    const categoryMap = new Map<string, number>();
    const locationMap = new Map<string, number>();
    const dailyTrend: { date: string; amount: number }[] = [];
    const timeMap = new Map<string, number>();
    let totalSpent = 0;

    // Group expenses by date for daily trend
    const dateMap = new Map<string, number>();

    expenses.forEach((expense: any) => {
      const amount = parseFloat(expense.amount) || 0;
      totalSpent += amount;

      // Category distribution
      const category = expense.categories?.category || 'Uncategorized';
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);

      // Location distribution
      const location = expense.locations?.location || expense._location || 'Unknown';
      locationMap.set(location, (locationMap.get(location) || 0) + amount);

      // Daily trend
      const date = expense.date;
      dateMap.set(date, (dateMap.get(date) || 0) + amount);

      // Time distribution (by hour of day)
      const createdAt = expense.created_at ? new Date(expense.created_at) : new Date();
      const hour = createdAt.getHours();
      const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      timeMap.set(timeOfDay, (timeMap.get(timeOfDay) || 0) + amount);
    });

    // Convert maps to arrays for the response
    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));

    const locationDistribution = Array.from(locationMap.entries()).map(([location, amount]) => ({
      location,
      amount
    }));

    // Sort dates for the trend
    const sortedDates = Array.from(dateMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());

    const dailyTrendData = sortedDates.map(([date, amount]) => ({
      date,
      amount
    }));

    const timeDistribution = Array.from(timeMap.entries()).map(([period, amount]) => ({
      period,
      amount
    }));

    return {
      success: true,
      data: {
        categoryDistribution,
        locationDistribution,
        dailyTrend: dailyTrendData,
        timeDistribution,
        totalSpent,
        count: expenses.length
      }
    };
  } catch (error) {
    logger.error('Error in getExpenseAnalytics:', error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get all expenses for a user
 * 
 * @param userId - The user ID to get expenses for
 * @param options - Optional parameters for filtering and pagination
 * @returns Promise with the expenses or error
 */
export async function getExpenses(
  userId?: string,
  options: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    locationId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<Expense[]> {
  try {
    // If userId is not provided, get the current user
    let finalUserId = userId;
    if (!finalUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.error('User not authenticated');
        return [];
      }
      finalUserId = user.id;
    }

    // Check if we have cached expenses for this user
    const cacheKey = `expenses_${finalUserId}_${JSON.stringify(options)}`;
    if (expensesCache[cacheKey]) {
      logger.info('Returning cached expenses');
      return expensesCache[cacheKey];
    }

    // Build the query
    let query = supabase
      .from('expenses')
      .select(`
        id, 
        amount, 
        date, 
        notes,
        split_type,
        categories(id, category),
        locations(id, location),
        users!paid_by(id, name, email)
      `)
      .eq('user_id', finalUserId);

    // Apply filters
    if (options.startDate && isValidISODate(options.startDate)) {
      query = query.gte('date', options.startDate);
    }

    if (options.endDate && isValidISODate(options.endDate)) {
      query = query.lte('date', options.endDate);
    }

    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.locationId) {
      query = query.eq('location_id', options.locationId);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'date';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Execute the query
    const { data: expenses, error } = await query;

    if (error) {
      logger.error('Error fetching expenses:', error);
      return [];
    }

    if (!expenses) {
      return [];
    }

    // Transform the data to match the Expense interface
    const transformedExpenses: Expense[] = expenses.map((expense: any) => ({
      id: expense.id,
      amount: parseFloat(expense.amount),
      date: expense.date,
      notes: expense.notes || '',
      _category: expense.categories?.category || 'Uncategorized',
      category_id: expense.categories?.id,
      _location: expense.locations?.location || 'Unknown',
      location_id: expense.locations?.id,
      split_type: expense.split_type || 'none',
      paid_by: expense.users?.id || finalUserId,
      paid_by_name: expense.users?.name || 'You',
      created_at: expense.created_at,
      updated_at: expense.updated_at
    }));

    // Cache the results
    expensesCache[cacheKey] = transformedExpenses;

    return transformedExpenses;
  } catch (error) {
    logger.error('Error in getExpenses:', error);
    return [];
  }
}