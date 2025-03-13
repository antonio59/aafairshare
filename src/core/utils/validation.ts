import { z } from 'zod';
import { Expense, ExpenseCreate } from '../types/expenses';

/**
 * Centralized validation schemas for core entities using Zod
 */

// Basic validators
export const nonEmptyString = z.string().min(1, 'This field is required');
export const optionalString = z.string().optional().nullable();
export const positiveNumber = z.number().positive('Amount must be positive').or(z.string().regex(/^\d*\.?\d+$/, 'Amount must be a positive number').transform(val => parseFloat(val)));
export const emailValidator = z.string().email('Invalid email format');
export const uuidValidator = z.string().uuid('Invalid UUID format');
export const dateValidator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Expense validators
export const expenseSchema = z.object({
  amount: positiveNumber,
  date: dateValidator,
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  split_type: z.enum(['equal', 'none'], {
    errorMap: () => ({ message: 'Split type must be "equal" or "none"' })
  }),
  paid_by: uuidValidator.nullable(),
  category_id: uuidValidator.nullable().optional(),
  location_id: uuidValidator.nullable().optional(),
});

export const expenseCreateSchema = expenseSchema.extend({
  category: z.string().optional(),
  location: z.string().optional(),
  locations: z.array(z.string()).optional(),
  _currency: z.string().optional(),
  _description: z.string().optional(),
});

// Helper validation functions
export function validateExpense(expense: Partial<Expense>): { 
  valid: boolean; 
  errors?: Record<string, string>;
} {
  try {
    expenseSchema.parse(expense);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          errors[err.path.join('.')] = err.message;
        }
      });
      
      return { valid: false, errors };
    }
    
    return { 
      valid: false, 
      errors: { general: 'Invalid expense data' } 
    };
  }
}

export function validateExpenseCreate(expense: Partial<ExpenseCreate>): { 
  valid: boolean; 
  errors?: Record<string, string>;
} {
  try {
    expenseCreateSchema.parse(expense);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          errors[err.path.join('.')] = err.message;
        }
      });
      
      return { valid: false, errors };
    }
    
    return { 
      valid: false, 
      errors: { general: 'Invalid expense data' } 
    };
  }
}

/**
 * Utility function to sanitize and round a monetary amount
 * @param value Amount as string or number
 * @param decimals Number of decimal places (default: 2)
 * @returns Sanitized amount as number or null if invalid
 */
export function sanitizeAmount(value: string | number | null | undefined, decimals = 2): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Convert string to number if needed
  let numValue: number;
  if (typeof value === 'string') {
    // Remove non-numeric chars except decimal point
    const sanitized = value.replace(/[^\d.-]/g, '');
    numValue = parseFloat(sanitized);
  } else {
    numValue = value;
  }
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return null;
  }
  
  // Round to specified number of decimal places
  const multiplier = Math.pow(10, decimals);
  return Math.round(numValue * multiplier) / multiplier;
}

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param dateString The date string to validate
 * @returns boolean indicating if the date is valid
 */
export function isValidDate(dateString: string): boolean {
  // Check format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  // Parse the date and check if it's valid
  const parts = dateString.split('-').map(part => parseInt(part, 10));
  const year = parts[0];
  const month = parts[1] - 1; // JavaScript months are 0-indexed
  const day = parts[2];
  
  const date = new Date(year, month, day);
  return date.getFullYear() === year && 
         date.getMonth() === month && 
         date.getDate() === day;
}

/**
 * Validates if a string is a valid email
 * @param email The email to validate
 * @returns boolean indicating if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is empty or only whitespace
 * @param str The string to check
 * @returns boolean indicating if the string is empty
 */
export function isEmpty(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim() === '';
} 