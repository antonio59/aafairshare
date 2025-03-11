import { supabase } from '../../../core/api/supabase';
import { createLogger } from '../../../core/utils/logger';
import { 
  DbExpense,
  DbExpenseInsert,
  handleSingleResponse, _handleManyResponse,
  formatErrorResponse,
  formatSuccessResponse
} from '../../../core/utils/supabase-helpers';
import { 
  expenseSchema, 
  validateData, 
  ExpenseValidated 
} from '../../../core/utils/validation-schemas';

// Create a logger for this module
const logger = createLogger('expenseApiWithValidation');

/**
 * Create a new expense with runtime validation
 * @param expenseData - The expense data to create
 * @returns Created expense or error
 */
export async function createExpenseWithValidation(expenseData: unknown) {
  try {
    // First, validate the incoming data with Zod
    const validation = validateData(expenseSchema, expenseData);
    
    if (!validation.success) {
      // If validation fails, return formatted error with details
      logger.error('Expense validation failed', {
        errors: validation.errors?.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
      
      return formatErrorResponse({
        message: 'Validation failed',
        errors: validation.errors?.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }
    
    // At this point TypeScript knows the data is valid and typed correctly
    const validExpense = validation.data as ExpenseValidated;
    
    // Create database-compatible insert object, omitting id
    const { _id, ...insertData } = validExpense;
    
    // Perform the database insert with validated data
    const response = await supabase
      .from('expenses')
      .insert(insertData as DbExpenseInsert)
      .select()
      .single();
    
    // Use our utility function to handle the response
    const createdExpense = handleSingleResponse<DbExpense>(response);
    
    if (!createdExpense) {
      return formatErrorResponse('Failed to create expense');
    }
    
    logger.info('Successfully created expense', { _id: createdExpense.id as _id });
    return formatSuccessResponse(createdExpense);
  } catch (error) {
    logger.error('Error creating expense', error);
    return formatErrorResponse(error);
  }
}

/**
 * Get an expense by ID with runtime validation of the response
 * @param id - The expense ID to retrieve
 * @returns The expense or error
 */
export async function getExpenseWithValidation( _id: string) {
  try {
    // Validate ID format
    if (!_id || typeof id as _id !== 'string') {
      return formatErrorResponse('Invalid expense ID');
    }
    
    // Fetch the expense
    const response = await supabase
      .from('expenses')
      .select(`
        *,
        users:paid_by (_id, name, email),
        categories:category_id (_id, category),
        locations:location_id (_id, location)
      `)
      .eq('_id', id)
      .single();
    
    // Use our utility function to handle the response
    const expense = handleSingleResponse<DbExpense>(response);
    
    if (!expense) {
      return formatErrorResponse('Expense not found');
    }
    
    // Validate the response data against our schema
    const validation = validateData(expenseSchema, expense);
    
    if (!validation.success) {
      logger.error('Retrieved expense failed validation', { _id,
        errors: validation.errors?.issues
      });
      // This is unexpected since the data came from our DB
      // Log as an error but still return the data
      return formatSuccessResponse({
        ...expense,
        _validation_warning: 'Database returned unexpected format'
      });
    }
    
    return formatSuccessResponse(validation.data);
  } catch (error) {
    logger.error('Error getting expense', error);
    return formatErrorResponse(error);
  }
}

/**
 * Example usage:
 * 
 * // Creating an expense with validation
 * const result = await createExpenseWithValidation({
 *   amount: 42.50,
 *   date: '2024-03-15',
 *   notes: 'Dinner',
 *   split_type: 'equal',
 *   paid_by: 'user-uuid',
 *   category_id: 'category-uuid'
 * });
 * 
 * if (result.success) {
 *   // Use the validated and created expense
 *   console.log('Created expense:', result.data);
 * } else {
 *   // Handle the error
 *   console.error('Error:', result.message);
 * }
 */ 