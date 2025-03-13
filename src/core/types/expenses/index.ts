import { Json } from "../supabase.types";

/**
 * Core expense interface for application-wide use
 * All expense-related components should use this interface or extend it
 */
export interface Expense {
  id: string;
  amount: number;
  date: string;
  notes?: string | null;
  split_type: "equal" | "none" | string;
  paid_by: string | null;
  category_id: string | null;
  location_id: string | null;
  created_at: string;
  updated_at: string;
  
  // Frontend-specific fields for display purposes
  _category?: string;
  _location?: string;
  _description?: string;
  _currency?: string;
  _all_locations?: string[];
  
  // User information fields for UI
  paid_by_name?: string;
  paid_by_email?: string;
  isOwner?: boolean;
}

/**
 * Interface for expense creation operations
 */
export interface ExpenseCreate {
  amount: number;
  date: string;
  notes?: string | null;
  split_type: "equal" | "none" | string;
  paid_by: string;
  category_id?: string | null;
  location_id?: string | null;
  
  // Convenience fields that get converted to IDs
  category?: string;
  location?: string;
  locations?: string[];
  
  // Additional metadata
  _currency?: string;
  _description?: string;
}

/**
 * Interface for expense update operations
 */
export interface ExpenseUpdate extends Partial<ExpenseCreate> {
  id: string;
}

/**
 * Interface for the ExpenseDetailPage and similar components
 */
export interface ExpenseDetails {
  id: string;
  amount: number;
  category?: string;
  description?: string;
  date: string;
  location?: string;
  currency?: string;
  user_id?: string;
  notes?: string | null;
  split_type?: string;
  locations?: string[];
}

/**
 * Interface for API responses involving expenses
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
  success?: boolean;
  message?: string;
}

/**
 * Interface for grouped expenses by date
 */
export interface GroupedExpenses {
  [date: string]: Expense[];
}

/**
 * Interface for monthly expense data
 */
export interface MonthlyExpenseData {
  month: string;
  expenses: Expense[];
  total: number;
  settled?: boolean;
  balance?: number;
}

/**
 * Valid error types for expense-related errors
 */
export type ExpenseErrorType = 'not_found' | 'not_authorized' | 'general' | null; 