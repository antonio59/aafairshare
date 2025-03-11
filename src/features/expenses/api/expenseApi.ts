// Expense operations - Core utility functions for expense management

import { supabase } from '@/core/api/supabase';
import { createLogger } from '@/core/utils/logger';
import { Database } from '../../../core/types/supabase.types';

// Create a logger for this module
const logger = createLogger('expenseApi');

// Define types based on the Supabase schema
type DbExpense = Database['public']['Tables']['expenses']['Row'];
type DbExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type DbExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
type DbUser = Database['public']['Tables']['users']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbLocation = Database['public']['Tables']['locations']['Row'];

// Cache implementation
interface Cache<T> {
  data: T | null;
  timestamp: number;
  expiresAt: number;
}

// Cache TTL set to 2 minutes (120000ms)
const CACHE_TTL = 120000;

// Cache object with parameterized keys
interface ExpensesCache {
  [key: string]: Cache<{
    expenses: Expense[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }>;
}

const expensesCache: ExpensesCache = {};

// Cache helper functions
function getCachedExpenses(
  userId: string, 
  limit: number, 
  page: number, 
  filters?: ExpenseFilters
): { expenses: Expense[], pagination: any } | null {
  const filterKey = filters ? JSON.stringify(filters) : 'default';
  const cacheKey = `${userId}:${limit}:${page}:${filterKey}`;
  
  if (!expensesCache[cacheKey]) return null;
  
  const cache = expensesCache[cacheKey];
  const now = Date.now();
  
  if (cache.data && now < cache.expiresAt) {
    logger.info('Using cached expenses from', new Date(cache.timestamp).toISOString());
    return cache.data;
  }
  
  return null;
}

function setCachedExpenses(
  userId: string,
  limit: number,
  page: number,
  data: { expenses: Expense[], pagination: any },
  filters?: ExpenseFilters
): void {
  const filterKey = filters ? JSON.stringify(filters) : 'default';
  const cacheKey = `${userId}:${limit}:${page}:${filterKey}`;
  const now = Date.now();
  
  expensesCache[cacheKey] = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL
  };
  
  logger.info('Updated expenses cache at', new Date(now).toISOString());
}

/**
 * Invalidates the expenses cache, forcing a fresh fetch on next request
 * 
 * This function clears all cached expense data, ensuring that subsequent
 * calls to fetch expense data will retrieve fresh data from the server.
 * It should be called after any operation that modifies expenses (create,
 * update, delete) to ensure the UI shows the most current data.
 * 
 * @returns {void}
 */
export function invalidateExpensesCache(): void {
  // Create a timestamp for logging
  const timestamp = new Date().toISOString();
  
  // Log the cache invalidation for debugging purposes
  logger.info(`Invalidating expenses cache at ${timestamp}`);
  
  // Clear all cached items by setting their data to null
  Object.keys(expensesCache).forEach(key => {
    expensesCache[key] = {
      data: null,
      timestamp: 0,
      expiresAt: 0
    };
  });
  
  // Also clear any persisted cache in localStorage
  try {
    localStorage.removeItem('expensesCache');
  } catch (_e) {
    // Ignore localStorage errors (might happen in SSR or if storage is full)
    logger.warn('Failed to clear localStorage cache:', _e);
  }
  
  // Log completion
  logger.info('Expenses cache cleared successfully');
}

// Helper function to parse and format dates
const parseUKDate = (dateString: string): string => {
  // If the date is in UK format (dd/mm/yyyy), convert it
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
};

const _formatToUKDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (_e) {
    return dateString;
  }
};

// Define the main Expense interface
export interface Expense extends DbExpense {
  // Additional fields not in the database schema but used in the frontend
  _currency?: string;
  _description?: string;
  _category?: string;
  _location?: string;
  split_with?: string;
  // These fields come from joined relations and are populated after fetch
  categories?: DbCategory;
  locations?: DbLocation;
  users?: DbUser;
  // Status property for filtering
  status?: string;
  // Use for analytics
  tags?: string[];
  image_url?: string;
  // Support for multiple locations
  _all_locations?: string[];
  // User information
  paid_by_name?: string;
  paid_by_email?: string;
  // Ownership flag
  isOwner?: boolean;
}

// Define interfaces for create and update operations
export interface ExpenseCreate extends DbExpenseInsert {
  _currency?: string;
  _description?: string;
  // For backward compatibility, allow category as _category and location as _location names
  // These will be converted to category_id and location_id
  category?: string;
  location?: string;
  // New field for multiple locations
  locations?: string[];
  location_ids?: string[];
  // Additional fields that may be present
  tags?: string[];
  image_url?: string;
}

export interface ExpenseUpdate extends DbExpenseUpdate {
  _currency?: string;
  _description?: string;
  // For backward compatibility in existing code
  _category?: string; // Will be ignored in database operations
  _location?: string; // Will be ignored in database operations
}

// Type for location junction query result
interface LocationJunctionResult {
  locations: {
    id: string;
    _location: string;
  };
}

// Define filter interface for expenses
export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  _category?: string | string[];
  _location?: string | string[];
  minAmount?: number;
  maxAmount?: number;
  splitType?: string;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Creates a new expense in the database
 * 
 * @param {ExpenseCreate} expenseData - The expense data
 * @returns {Promise<Expense | null>} - The created expense or null
 */
export const createNewExpense = async (expenseData: ExpenseCreate) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Parse the date if it's in UK format
    const date = parseUKDate(expenseData.date);

    // Process category
    let categoryId: string | null = null;
    
    // If category_id is provided directly, use it
    if (expenseData.category_id) {
      categoryId = expenseData.category_id;
      logger.info('Using provided category_id:', { categoryId });
    } 
    // If category name is provided, look it up
    else if (expenseData._category) {
      logger.info('Looking up _category by name:', { _category: expenseData.category as _category });
      
      // First check if the category exists
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('_category', expenseData.category)
        .single();
      
      if (categoryError && categoryError.code !== 'PGRST116') {
        logger.error('Error finding _category:', categoryError);
      }
      
      if (categoryData && !('error' in categoryData)) {
        // Safe type assertion after checking it's not an error
        categoryId = (categoryData as unknown as { id: string }).id;
      }
    }
    logger.info('Found _category:', { categoryId });

    // Handle locations
    let locationId = null;
    let locationIds: string[] = [];
    
    // If location_ids array is provided directly, use it
    if (expenseData.location_ids && Array.isArray(expenseData.location_ids) && expenseData.location_ids.length > 0) {
      locationIds = expenseData.location_ids;
      logger.info('Using provided location_ids:', { locationIds });
      
      // Set the primary location_id to the first one for backward compatibility
      locationId = locationIds[0];
    } 
    // If locations array is provided, look them up or create them
    else if (expenseData.locations && Array.isArray(expenseData.locations) && expenseData.locations.length > 0) {
      logger.info('Processing multiple locations:', { locations: expenseData.locations });
      
      for (const locationName of expenseData.locations) {
        // Skip empty location as _location as _location names
        if (!locationName) continue;
        
        // Check if the location exists
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('id')
          .eq('_location', locationName)
          .single();
          
        if (locationError && locationError.code !== 'PGRST116') {
          logger.error('Error finding _location:', locationError);
        }
          
        if (locationData && !('error' in locationData)) {
          // Safe type assertion after checking it's not an error
          const id = (locationData as unknown as { id: string }).id;
          locationIds.push(id);
        } else {
          // Create new location as _location as _location
          logger.info('Creating new _location:', { location: locationName });
          
          const { data: newLocation, error: newLocationError } = await supabase
            .from('locations')
            .insert({
              _location: locationName
            })
            .select('id')
            .single();
            
          if (newLocationError) {
            logger.error('Error creating _location:', newLocationError);
            throw newLocationError;
          }
          
          if (newLocation && !('error' in newLocation)) {
            // Safe type assertion after checking it's not an error
            const id = (newLocation as unknown as { id: string }).id;
            locationIds.push(id);
          }
        }
      }
      
      // Set the primary location_id to the first one for backward compatibility
      if (locationIds.length > 0) {
        locationId = locationIds[0];
      }
    }
    // Fall back to the single location field for backward compatibility
    else if (expenseData.location_id) {
      locationId = expenseData.location_id;
      locationIds = [locationId];
      logger.info('Using provided location_id:', { locationId });
    } 
    // If location name is provided, look it up or create it
    else if (expenseData._location) {
      logger.info('Processing _location:', { _location: expenseData.location as _location });
      
      // Check if the location exists
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('id')
        .eq('_location', expenseData.location)
        .single();
        
      if (locationError && locationError.code !== 'PGRST116') {
        logger.error('Error finding _location:', locationError);
      }
        
      if (locationData && !('error' in locationData)) {
        // Safe type assertion after checking it's not an error
        locationId = (locationData as unknown as { id: string }).id;
        locationIds = [locationId];
        logger.info('Found existing _location:', { locationId });
      } else {
        // Create new location as _location as _location
        logger.info('Creating new _location:', { location: expenseData.location });
        
        const { data: newLocation, error: newLocationError } = await supabase
          .from('locations')
          .insert({
            _location: expenseData.location as _location
          })
          .select('id')
          .single();
          
        if (newLocationError) {
          logger.error('Error creating _location:', newLocationError);
          throw newLocationError;
        }
        
        if (newLocation && !('error' in newLocation)) {
          // Safe type assertion after checking it's not an error
          locationId = (newLocation as unknown as { id: string }).id;
          locationIds = [locationId];
          logger.info('Created new _location:', { locationId });
        }
      }
    }

    // Create the expense record with required fields
    // Create a simpler expense object and cast it to the required type
    // to work around TypeScript strictness
    const expenseToCreate = {
      amount: expenseData.amount,
      date: date,
      paid_by: user.id,
      category_id: categoryId || '',  // Empty string as fallback for required field
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as DbExpenseInsert;

    // Add optional fields only if they exist
    if (locationId) expenseToCreate.location_id = locationId;
    if (expenseData.notes) expenseToCreate.notes = expenseData.notes;
    if (expenseData.split_type) expenseToCreate.split_type = expenseData.split_type;

    logger.info('Creating expense with data:', { expenseToCreate });

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert(expenseToCreate)
      .select(`
        *,
        categories (*),
        locations (*),
        users (*)
      `)
      .single();

    if (error) {
      logger.error('Error creating expense:', error);
      throw error;
    }

    if (!expense) {
      logger.error('No expense returned after creation');
      return null;
    }

    // If we have multiple locations, add them to the junction table
    if (locationIds.length > 1) {
      const expenseLocationsToInsert = locationIds.map(locId => ({
        expense_id: (expense as unknown as { id: string }).id,
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

    // Safely cast the response to a proper type
    const safeExpense = expense as unknown as Record<string, any>;
    
    const formattedExpense: Expense = {
      ...safeExpense as Expense, _category: safeExpense.categories?.category as _category as _category || null, _location: safeExpense.locations?.location as _location as _location || null,
    };

    return formattedExpense;
  } catch (error) {
    logger.error('Error in createNewExpense:', error);
    throw error;
  }
};

/**
 * Fetches user expenses with pagination, filtering, and caching
 * 
 * @param {number} limit - Number of expenses per page
 * @param {number} page - Page number (0-indexed)
 * @param {ExpenseFilters} filters - Optional filters for the query
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise} - Object with expenses and pagination info
 */
export const fetchUserExpenses = async (
  limit = 5, 
  page = 0, 
  filters?: ExpenseFilters, 
  forceRefresh = false
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedExpenses(user.id, limit, page, filters);
      if (cachedData) {
        return cachedData;
      }
    }

    const offset = page * limit;
    let query = supabase.from('expenses').select('*', { count: 'exact', head: true });

    // Apply filters if provided
    if (filters) {
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      
      if (filters._category) {
        // For category as _category as _category filtering, fetch the category IDs first and then apply them
        if (Array.isArray(filters._category) && filters.category.length > 0) {
          try {
            const { data: categoryData, error: categoryError } = await supabase
              .from('categories')
              .select('id')
              .in('_category', filters.category);
              
            if (categoryError) {
              logger.warn('Error fetching categories:', categoryError);
            } else if (categoryData && categoryData.length > 0) {
              // Safe array mapping with fallback
              const categoryIds = categoryData
                .filter(cat => cat && typeof cat === 'object' && 'id' in cat)
                .map(cat => (cat as unknown as { id: string }).id);
                
              if (categoryIds.length > 0) {
                query = query.in('category_id', categoryIds);
              }
            }
          } catch (err) {
            logger.warn('Exception in _category filtering:', err);
          }
        } else if (typeof filters._category === 'string') {
          try {
            const { data: categoryData, error: categoryError } = await supabase
              .from('categories')
              .select('id')
              .eq('_category', filters.category)
              .single();
              
            if (categoryError) {
              logger.warn('Error fetching _category:', categoryError);
            } else if (categoryData && typeof categoryData === 'object' && 'id' in categoryData) {
              query = query.eq('category_id', (categoryData as unknown as { id: string }).id);
            }
          } catch (err) {
            logger.warn('Exception in _category filtering:', err);
          }
        }
      }
      
      if (filters._location) {
        // For location as _location as _location filtering, fetch the location IDs first and then apply them
        if (Array.isArray(filters._location) && filters.location.length > 0) {
          try {
            const { data: locationData, error: locationError } = await supabase
              .from('locations')
              .select('id')
              .in('_location', filters.location);
              
            if (locationError) {
              logger.warn('Error fetching locations:', locationError);
            } else if (locationData && locationData.length > 0) {
              // Safe array mapping with fallback
              const locationIds = locationData
                .filter(loc => loc && typeof loc === 'object' && 'id' in loc)
                .map(loc => (loc as unknown as { id: string }).id);
                
              if (locationIds.length > 0) {
                query = query.in('location_id', locationIds);
              }
            }
          } catch (err) {
            logger.warn('Exception in _location filtering:', err);
          }
        } else if (typeof filters._location === 'string') {
          try {
            const { data: locationData, error: locationError } = await supabase
              .from('locations')
              .select('id')
              .eq('_location', filters.location)
              .single();
              
            if (locationError) {
              logger.warn('Error fetching _location:', locationError);
            } else if (locationData && typeof locationData === 'object' && 'id' in locationData) {
              query = query.eq('location_id', (locationData as unknown as { id: string }).id);
            }
          } catch (err) {
            logger.warn('Exception in _location filtering:', err);
          }
        }
      }
      
      if (filters.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
      }
      
      if (filters.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
      }
      
      if (filters.splitType) {
        query = query.eq('split_type', filters.splitType);
      }
    }

    // Always filter by current user
    query = query.eq('paid_by', user.id);
    
    // Get total count for pagination
    const { count, error: countError } = await query;

    if (countError) {
      throw countError;
    }

    // Build query for actual data
    let dataQuery = supabase
      .from('expenses')
      .select(`
        *,
        categories (*),
        locations (*),
        users (*)
      `)
      .eq('paid_by', user.id);
      
    // Apply the same filters to the data query
    if (filters) {
      if (filters.startDate) {
        dataQuery = dataQuery.gte('date', filters.startDate);
      }
      
      if (filters.endDate) {
        dataQuery = dataQuery.lte('date', filters.endDate);
      }
      
      // Apply the same category filters
      if (filters._category) {
        // For category as _category as _category filtering, fetch the category IDs first and then apply them
        if (Array.isArray(filters._category) && filters.category.length > 0) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .in('_category', filters.category);
            
          if (categoryData && categoryData.length > 0) {
            // Type assertion to ensure we can access id property
            const categoryIds = categoryData.map(cat => ((cat as unknown) as { id: string }).id);
            dataQuery = dataQuery.in('category_id', categoryIds);
          }
        } else if (typeof filters._category === 'string') {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('_category', filters.category)
            .single();
            
          if (categoryData) {
            // Type assertion to ensure we can access id property
            dataQuery = dataQuery.eq('category_id', ((categoryData as unknown) as { id: string }).id);
          }
        }
      }
      
      // Apply the same location filters
      if (filters._location) {
        // For location as _location as _location filtering, fetch the location IDs first and then apply them
        if (Array.isArray(filters._location) && filters.location.length > 0) {
          const { data: locationData } = await supabase
            .from('locations')
            .select('id')
            .in('_location', filters.location);
            
          if (locationData && locationData.length > 0) {
            // Type assertion to ensure we can access id property
            const locationIds = locationData.map(loc => ((loc as unknown) as { id: string }).id);
            dataQuery = dataQuery.in('location_id', locationIds);
          }
        } else if (typeof filters._location === 'string') {
          const { data: locationData } = await supabase
            .from('locations')
            .select('id')
            .eq('_location', filters.location)
            .single();
            
          if (locationData) {
            // Type assertion to ensure we can access id property
            dataQuery = dataQuery.eq('location_id', ((locationData as unknown) as { id: string }).id);
          }
        }
      }
      
      if (filters.minAmount !== undefined) {
        dataQuery = dataQuery.gte('amount', filters.minAmount);
      }
      
      if (filters.maxAmount !== undefined) {
        dataQuery = dataQuery.lte('amount', filters.maxAmount);
      }
      
      if (filters.splitType) {
        dataQuery = dataQuery.eq('split_type', filters.splitType);
      }
      
      // Apply sorting if specified
      if (filters.sortBy) {
        dataQuery = dataQuery.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      } else {
        // Default sorting
        dataQuery = dataQuery.order('date', { ascending: false });
      }
    } else {
      // Default sorting
      dataQuery = dataQuery.order('date', { ascending: false });
    }
    
    // Apply pagination
    dataQuery = dataQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data, error } = await dataQuery;

    if (error) {
      throw error;
    }

    // Format data for frontend with proper type handling
    const typedData = data as unknown as Array<Expense & {
      categories?: DbCategory;
      locations?: DbLocation;
      users?: DbUser;
      paid_by?: string;
    }>;
    
    const expenses = typedData.map(expense => ({
      ...expense, _category: expense.categories?.category as _category as _category || undefined, _location: expense.locations?.location as _location as _location || undefined,
      isPaidByCurrentUser: expense.paid_by === user.id,
      // Clean up nested objects
      categories: undefined,
      locations: undefined,
      users: undefined
    }));

    const result = {
      expenses,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    };
    
    // Cache the result
    setCachedExpenses(user.id, limit, page, result, filters);

    return result;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return {
      expenses: [],
      pagination: {
        total: 0,
        page,
        limit,
        pages: 0
      }
    };
  }
};

/**
 * Update an existing expense
 * 
 * @param {string} expenseId - The ID of the expense to update
 * @param {ExpenseUpdate} expenseData - The updated expense data
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export async function updateExpense(expenseId: string, expenseData: ExpenseUpdate): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Filter out properties that don't exist in the database schema
    const { _category, _location, _currency, _description, _user_id,
      locations, // Add this to remove the locations field
      _all_locations, // Also filter out all_locations if present
      ...validExpenseData 
    } = expenseData as any;

    logger.info(`Updating expense with ID ${expenseId}`, validExpenseData);

    // Parse date if provided
    if (validExpenseData.date) {
      validExpenseData.date = parseUKDate(validExpenseData.date);
    }

    // Add updated_at timestamp
    validExpenseData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('expenses')
      .update(validExpenseData)
      .eq('id', expenseId)
      .eq('paid_by', user.id);

    if (error) {
      logger.error('Error updating expense:', error);
      return false;
    }

    // Update the locations in the junction table if locations were provided
    if (locations && Array.isArray(locations) && locations.length > 0) {
      try {
        // First delete existing locations
        await supabase
          .from('expense_locations')
          .delete()
          .eq('expense_id', expenseId);
          
        // Then add new locations
        const locationPromises = locations.map(async (locationName) => {
          // First try to find the location as _location as _location
          const { data: locationData } = await supabase
            .from('locations')
            .select('id')
            .eq('_location', locationName)
            .single();
            
          let locationId = (locationData as unknown as { id?: string })?.id;
            
          // If location doesn't exist, create it
          if (!locationId) {
            const { data: newLocation } = await supabase
              .from('locations')
              .insert({ _location: locationName })
              .select('id')
              .single();
              
            locationId = (newLocation as unknown as { id?: string })?.id;
          }
            
          if (locationId) {
            // Add to junction table
            return supabase
              .from('expense_locations')
              .insert({
                expense_id: expenseId,
                location_id: locationId
              });
          }
        });
          
        await Promise.all(locationPromises);
      } catch (locationError) {
        logger.error('Error updating expense locations:', locationError);
        // Continue even if location as _location as _location update fails
      }
    }

    // Invalidate cache on data change
    invalidateExpensesCache();

    return true;
  } catch (error) {
    logger.error('Error in updateExpense:', error);
    return false;
  }
}

/**
 * Get detailed information about a specific expense
 * 
 * This function retrieves comprehensive information about an expense, including:
 * - Basic expense data (amount, date, notes, etc.)
 * - Related category and location information
 * - User details for the person who paid
 * - Additional metadata like ownership status
 * 
 * It includes validation for UUID format and user authentication, and
 * enhances the returned data with frontend-specific fields.
 * 
 * @param {string} expenseId - The UUID of the expense to retrieve
 * @returns {Promise<Expense | null>} The expense details or null if not found
 * @throws Will throw an error if the UUID is invalid, the user is not authenticated,
 *         or there's a database error
 */
export const getExpenseDetails = async (expenseId: string): Promise<Expense | null> => {
  try {
    if (!expenseId) {
      const error = new Error('Expense ID is required');
      // @ts-expect-error - Adding custom property for error type
      error.code = 'INVALID_ID';
      throw error;
    }

    // Validate UUID format to prevent SQL injection and database errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(expenseId)) {
      logger.error('Invalid UUID format in getExpenseDetails:', expenseId);
      const error = new Error('Invalid expense ID format');
      // @ts-expect-error - Adding custom property for error type
      error.code = 'INVALID_UUID';
      throw error;
    }

    // Get current user to check ownership
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      const error = new Error('User not authenticated');
      // @ts-expect-error - Adding custom property for error type
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    // First get the basic expense data
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        categories (*),
        locations (*),
        users:paid_by (*)
      `)
      .eq('id', expenseId)
      .single();
      
    if (error) {
      logger.error('Database error fetching expense:', error);
      
      if (error.code === 'PGRST116') {
        // This is the "not found" error code from PostgREST
        const notFoundError = new Error('Expense not found');
        // @ts-expect-error - Adding custom property for error type
        notFoundError.code = 'NOT_FOUND';
        throw notFoundError;
      }
      
      throw error;
    }
    
    if (!data) {
      const notFoundError = new Error('Expense not found');
      // @ts-expect-error - Adding custom property for error type
      notFoundError.code = 'NOT_FOUND';
      throw notFoundError;
    }

    // Get all locations for this expense from the junction table
    const { data: locationData, error: locationError } = await supabase
      .from('expense_locations')
      .select(`
        locations (id, _location)
      `)
      .eq('expense_id', expenseId);

    if (locationError) {
      console.error('Error fetching expense locations:', locationError);
      // Continue with the basic expense data
    }

    // Cast the response to handle nested fields - two-step casting to avoid TypeScript errors
    const expense = data as unknown as Expense & {
      users?: { id: string; name: string; email: string };
    };

    // Format the expense data for the frontend
    const formattedExpense: Expense = {
      ...expense, _category: expense.categories?.category as _category as _category || undefined, _location: expense.locations?.location as _location as _location || undefined,
      // Process user information for "Paid By" field
      paid_by_name: expense.users?.name || expense.users?.email || 'Unknown',
      paid_by_email: expense.users?.email || undefined,
      // Set isOwner flag based on whether the current user is the creator
      isOwner: currentUser.id === expense.paid_by,
      // Add all locations from the junction table
      _all_locations: locationData ? 
        locationData.map((item: any) => item.locations?._location).filter(Boolean) : 
        []
    };

    // Log for debugging
    console.log('Expense details retrieved successfully:', expenseId);
    
    return formattedExpense;
  } catch (error) {
    logger.error('Error fetching expense details:', error);
    throw error;
  }
};

/**
 * Get analytics data for expenses in a date range
 * This function leverages Web Workers for heavy computation
 * 
 * @param {string} startDate - Start date for analytics range
 * @param {string} endDate - End date for analytics range
 * @returns {Promise} - Object with analytics data
 */
export const getExpenseAnalytics = async (startDate: string, endDate: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Analytics date range (original):', { startDate, endDate });
    // Add timestamps for better inclusivity
    const startDateWithTime = `${startDate}T00:00:00.000Z`;
    const endDateWithTime = `${endDate}T23:59:59.999Z`;
    console.log('Analytics date range (with time):', { startDateWithTime, endDateWithTime });

    // Fetch expenses in date range - show ALL expenses (not filtered by user)
    // This ensures both users see the same analytics data
    const { data: expensesData, error } = await supabase
      .from('expenses')
      .select(`
        *,
        categories (*),
        locations (*)
      `)
      // Removed the .eq('paid_by', user.id) filter to show all expenses
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Type assertion to help TypeScript understand the data structure
    const typedExpensesData = expensesData as unknown as Array<DbExpense & {
      categories?: DbCategory;
      locations?: DbLocation;
    }>;

    // Debug: Log raw expense data
    console.log(`Raw expenses from Supabase (${typedExpensesData?.length || 0} items):`, typedExpensesData);
    console.log('Query filters used:', { 
      date_gte: startDate, 
      date_lte: endDate 
    });

    // Check if any user ID is owned by the current user
    if (typedExpensesData?.length) {
      console.log('User IDs in data:', typedExpensesData.map(_e => e.paid_by));
      console.log('Current user ID:', user.id);
      console.log('Expenses matching current user:', 
        typedExpensesData.filter(_e => e.paid_by === user.id).length);
    }

    // Use the Web Worker for heavy calculations instead of processing on the main thread
    try {
      // Import the worker manager only when needed (dynamic import)
      const { processAnalyticsData } = await import('../../../utils/worker-manager');
      
      // Process the data using the Web Worker
      const result = await processAnalyticsData(typedExpensesData);
      
      console.log('Analytics processed by Web Worker:', result);
      return result;
    } catch (workerError) {
      // If the Worker fails, fall back to processing on the main thread
      console.error('Web Worker processing failed, falling back to main thread:', workerError);
      
      // Use the typedExpensesData for analytics processing
      if (!typedExpensesData || typedExpensesData.length === 0) {
        return {
          categoryData: [],
          locationData: [],
          timeData: [],
          trendData: {
            daily: []
          },
          totals: {
            overall: 0,
            average: 0
          }
        };
      }

      // Group expenses by category and calculate totals
      const categoryData = typedExpensesData.reduce((acc, expense) => {
        const _category = expense.categories?.category as _category as _category || 'Uncategorized';
        if (!acc[_category]) {
          acc[category] = 0;
        }
        const amount = parseFloat(String(expense.amount || '0'));
        console.log(`Adding expense: ${amount} to _category ${ _category} (date: ${expense.date})`);
        acc[category] += amount;
        return acc;
      }, {} as Record<string, number>);

      // Debug: Log category totals
      console.log('Category data:', categoryData);

      const categoryChartData = Object.keys(categoryData).map(category => ({ _category,
        amount: parseFloat(categoryData[_category].toFixed(2))
      }));

      // Debug: Log final category chart data
      console.log('Final _category chart data:', categoryChartData);

      // Process data for location chart
      const locationData: Record<string, number> = {};
      typedExpensesData.forEach(expense => {
        const _location = expense.locations?.location as _location as _location || 'Unknown';
        if (!locationData[_location]) {
          locationData[location] = 0;
        }
        locationData[location] += parseFloat(String(expense.amount || '0'));
      });

      const locationChartData = Object.keys(locationData).map(location => ({ _location,
        amount: parseFloat(locationData[_location].toFixed(2))
      }));

      // Process data for time chart (by month)
      const timeData: Record<string, number> = {};
      typedExpensesData.forEach(expense => {
        const date = new Date(String(expense.date || ''));
        const monthYear = date.toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric'
        });

        if (!timeData[monthYear]) {
          timeData[monthYear] = 0;
        }
        const amount = parseFloat(String(expense.amount || '0'));
        console.log(`Adding ${amount} to month ${monthYear} (date: ${expense.date})`);
        timeData[monthYear] += amount;
      });

      // Debug: Log month totals
      console.log('Time data by month:', timeData);

      // Convert to array and sort by date
      const timeChartData = Object.keys(timeData).map(monthYear => ({
        period: monthYear,
        amount: parseFloat(timeData[monthYear].toFixed(2))
      }));

      // Sort time data chronologically
      timeChartData.sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });

      // Debug: Log final time chart data
      console.log('Final time chart data:', timeChartData);

      // Calculate daily spending trend
      const dailySpending: Record<string, number> = {};
      typedExpensesData.forEach(expense => {
        const date = String(expense.date || '');
        if (!dailySpending[date]) {
          dailySpending[date] = 0;
        }
        const amount = parseFloat(String(expense.amount || '0'));
        console.log(`Adding ${amount} to daily trend (date: ${date})`);
        dailySpending[date] += amount;
      });

      const trendData = {
        daily: Object.keys(dailySpending).map(date => ({
          date,
          amount: parseFloat(dailySpending[date].toFixed(2))
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };

      console.log('Daily spending trend data:', trendData.daily);

      let totalSpending = 0;
      
      // Calculate total spending directly from expenses
      typedExpensesData.forEach(exp => {
        const amount = parseFloat(String(exp.amount || '0'));
        console.log(`Adding to total: ${amount} (date: ${exp.date})`);
        totalSpending += amount;
      });

      console.log(`Total spending calculated: ${totalSpending.toFixed(2)}`);
      
      const result = {
        categoryData: categoryChartData,
        locationData: locationChartData,
        timeData: timeChartData,
        trendData,
        totalSpending: parseFloat(totalSpending.toFixed(2)),
        expenseCount: typedExpensesData.length
      };
      
      console.log('Final analytics result:', result);
      return result;
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return { 
      categoryData: [], 
      locationData: [],
      timeData: [],
      trendData: {
        daily: []
      },
      totalSpending: 0,
      expenseCount: 0 
    };
  }
};

/**
 * Create an expense - Legacy method, use createNewExpense instead
 * 
 * @param {ExpenseCreate} expense - The expense data
 * @returns {Promise<Expense | null>} - The created expense or null
 */
export async function createExpense(expense: ExpenseCreate): Promise<Expense | null> {
  try {
    console.log('Creating expense:', expense);
    const result = await createNewExpense(expense);
    
    // Ensure we invalidate the cache on data change
    console.log('Invalidating cache after creating expense');
    invalidateExpensesCache();
    
    // Log success for debugging
    if (result) {
      console.log('Expense created successfully:', result.id);
    } else {
      console.warn('Expense creation returned null');
    }
    
    return result;
  } catch (error) {
    logger.error('Error creating expense:', error);
    return null;
  }
}

/**
 * Delete an expense
 * 
 * This function handles the complete deletion workflow for an expense:
 * 1. Validates the expense ID format
 * 2. Checks user authentication
 * 3. Verifies the user has permission to delete the expense
 * 4. Performs the deletion operation
 * 5. Invalidates cache to ensure UI consistency
 * 
 * @param {string} expenseId - The UUID of the expense to delete
 * @returns {Promise<{ success: boolean, message: string }>} Result object with success status and message
 */
export const deleteExpense = async (expenseId: string): Promise<{ success: boolean, message: string }> => {
  if (!expenseId || typeof expenseId !== 'string') {
    logger.error('Invalid expense ID for deletion:', expenseId);
    return { success: false, message: 'Invalid expense ID' };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error('User not authenticated for deletion');
      return { success: false, message: 'You must be logged in to delete expenses' };
    }
    
    // Get the expense to verify ownership
    logger.info(`Fetching expense ${expenseId} for deletion validation`);
    const { data: expense, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();
      
    if (fetchError) {
      logger.error('Error fetching expense for deletion:', fetchError);
      return { success: false, message: `Error fetching expense: ${fetchError.message}` };
    }
    
    if (!expense) {
      logger.error('Expense not found for deletion:', expenseId);
      return { success: false, message: 'Expense not found' };
    }

    // Check if the current user owns this expense
    if ((expense as unknown as { paid_by: string }).paid_by !== user.id) {
      logger.error('User attempted to delete another user\'s expense:', { 
        expenseId, 
        ownerId: (expense as unknown as { paid_by: string }).paid_by, 
        requesterId: user.id 
      });
      return {
        success: false,
        message: 'You can only delete expenses you created'
      };
    }

    // Proceed with deletion
    logger.info(`Deleting expense ${expenseId}`);
    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (deleteError) {
      logger.error('Error deleting expense:', deleteError);
      return { success: false, message: `Error deleting expense: ${deleteError.message}` };
    }

    // If we got here, deletion was successful
    logger.info(`Successfully deleted expense ${expenseId}`);
    
    // Invalidate cache immediately after successful deletion
    console.log('Invalidating cache after expense deletion');
    invalidateExpensesCache();
    
    return { success: true, message: 'Expense deleted successfully' };
  } catch (error) {
    const err = error as Error;
    logger.error('Unexpected error in deleteExpense:', err);
    return { success: false, message: `Unexpected error: ${err.message}` };
  }
};

/**
 * Get a simple version of an expense by ID
 * 
 * This is a lightweight version of getExpenseDetails that returns
 * just the basic expense data without additional processing.
 * Used when only basic expense information is needed.
 * 
 * @param {string} id - The UUID of the expense to retrieve
 * @returns {Promise<Expense | null>} Basic expense data or null if not found
 */
export async function getExpense(id: string): Promise<Expense | null> {
  try {
    const response = await getExpenseDetails(id);
    return response;
  } catch (error) {
    logger.error('Error in getExpense:', error);
    return null;
  }
}

/**
 * Get expenses for a user
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<Expense[]>} - Array of expenses
 */
export async function getExpenses(userId: string): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        categories (*),
        locations (*)
      `)
      .eq('paid_by', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Expense[];
  } catch (error) {
    logger.error('Error fetching expenses:', error);
    return [];
  }
}