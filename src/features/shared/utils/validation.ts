import { z } from 'zod';

// Financial validation schemas
export const amountSchema = z
  .number()
  .positive()
  .finite()
  .max(1000000, 'Amount cannot exceed 1,000,000')
  .transform((val) => parseFloat(val.toFixed(2)));

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date');

export const categorySchema = z
  .string()
  .min(1, 'Category is required')
  .max(50, 'Category name too long');

export const locationSchema = z
  .string()
  .max(100, 'Location name too long')
  .optional();

export const notesSchema = z
  .string()
  .max(500, 'Notes too long')
  .optional();

// Expense validation schema
export const expenseSchema = z.object({
  amount: amountSchema,
  date: dateSchema,
  category_id: z.string().uuid('Invalid category ID').nullable().optional(),
  location_id: z.string().uuid('Invalid location ID').nullable().optional(),
  notes: notesSchema,
  split_type: z.enum(['equal', 'none']),
  paid_by: z.string().uuid('Invalid user ID'),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationError {
  success: false;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Validation helper functions
export function validateExpense(data: unknown): ValidationResult<ExpenseSchema> {
  try {
    return {
      success: true,
      data: expenseSchema.parse(data)
    };
  } catch (error) {
    console.error('Expense validation error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'An unexpected error occurred during validation'
      }]
    };
  }
}

export function sanitizeAmount(amount: number | string): string {
  // Remove non-numeric characters except decimal point
  const cleaned = String(amount).replace(/[^\d.]/g, '');
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return cleaned;
}

export function validateCSRFToken(token: unknown): boolean {
  // Validate CSRF token format
  if (!token || typeof token !== 'string') return false;
  // Check if token matches expected format (UUID v4)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
} 