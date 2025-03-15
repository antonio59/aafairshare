import { z } from 'zod';

/**
 * Zod schemas for validating database entities at runtime.
 * These complement TypeScript types by providing runtime validation.
 */

// Basic validators
export const nonEmptyString = z.string().min(1, 'This field is required');
export const optionalString = z.string().optional().nullable();
export const positiveNumber = z.number().positive('Amount must be positive')
  .or(z.string().regex(/^\d*\.?\d+$/, 'Amount must be a positive number').transform(val => parseFloat(val)));
export const emailValidator = z.string().email('Invalid email format');
export const uuidValidator = z.string().uuid('Invalid UUID format');
export const dateValidator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Amount validation schema
export const amountSchema = positiveNumber.transform((val) => parseFloat(val.toFixed(2)));

// Category validation schema
export const categorySchema = z.object({
  id: uuidValidator.optional(),
  category: z.string().min(1, 'Category name is required').max(50, 'Category name too long'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Location validation schema
export const locationSchema = z.object({
  id: uuidValidator.optional(),
  location: z.string().min(1, 'Location name is required').max(100, 'Location name too long'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Expense validation schema
export const expenseSchema = z.object({
  id: uuidValidator.optional(),
  amount: amountSchema,
  date: dateValidator,
  notes: z.string().max(500, 'Notes too long').optional().nullable(),
  split_type: z.enum(['equal', 'none'], {
    errorMap: () => ({ message: 'Split type must be "equal" or "none"' })
  }),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  paid_by: uuidValidator,
  category_id: uuidValidator.nullable().optional(),
  location_id: uuidValidator.nullable().optional()
});

// Expense create schema
export const expenseCreateSchema = expenseSchema.extend({
  category: z.string().optional(),
  location: z.string().optional(),
  locations: z.array(z.string()).optional(),
  _currency: z.string().optional(),
  _description: z.string().optional()
});

// Settlement validation schema
export const settlementSchema = z.object({
  id: z.string().uuid('Invalid settlement ID'),
  user_id: z.string().uuid('Invalid user ID'),
  month_year: z.string().regex(/^[A-Za-z]+ \d{4}$/, 'Invalid month/year format'),
  amount: z.number().positive('Amount must be positive'),
  status: z.enum(['pending', 'completed']),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

// Type inference from the Zod schemas
export type CategoryValidated = z.infer<typeof categorySchema>;
export type LocationValidated = z.infer<typeof locationSchema>;
export type ExpenseValidated = z.infer<typeof expenseSchema>;
export type SettlementValidated = z.infer<typeof settlementSchema>;

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Validate data against a schema and return the result
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with validation result
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Example usage:
 * 
 * // Validate an expense
 * const { success, data, errors } = validateData(expenseSchema, expenseData);
 * if (success) {
 *   // Use validated data
 *   saveExpense(data);
 * } else {
 *   // Handle validation errors
 *   const formattedErrors = errors.issues.map(issue => ({
 *     path: issue.path.join('.'),
 *     message: issue.message
 *   }));
 * }
 */