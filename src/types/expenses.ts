/**
 * Type definitions for expense-related data
 * 
 * @module types/expenses
 */
import type { Database } from './supabase';

export type SplitType = 'Equal' | 'No Split';

/**
 * Represents an expense record
 */
export interface Expense {
  id: string;
  amount: number;
  category_id: string | null;
  location_id: string | null;
  notes: string;
  date: string;
  paid_by: string | null;
  split_type: SplitType | string | null;
  users: {
    name: string | null;
  } | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ExpenseFilters {
  startDate: string;
  endDate: string;
}

// Updated Settlement interface to match the database schema
export interface Settlement {
  id: string;
  user_id?: string | null;
  month_year: string;
  amount: number;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at?: string | null;
  settled_at?: string | null;
  is_settled?: boolean;
  settled_date?: string | null;
  // Additional fields for UI display that aren't in the database
  from?: string;
  to?: string;
  month?: string;
}

export type ExpenseWithUser = Database['public']['Tables']['expenses']['Row'] & {
  users: {
    name: string;
  };
};

export interface ExportableExpense extends Omit<Expense, 'id' | 'created_at'> {
  category: string;
  location: string;
}

/**
 * Data structure for creating a new expense
 * Omits auto-generated fields like id and timestamps
 */
export type NewExpense = Omit<Expense, 'id' | 'created_at'>;

/**
 * Data structure for updating an existing expense
 * Requires id and at least one other field
 */
export type UpdateExpense = Pick<Expense, 'id'> & Partial<Omit<Expense, 'id' | 'created_at'>>;
