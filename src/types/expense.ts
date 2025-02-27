import type { Json } from './database.types';

/**
 * Interface for expense category data
 */
export interface Category {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  created_at?: string;
  category_group_id?: string | null;
  groupId?: string; // Frontend compatibility
}

/**
 * Interface for category group data
 */
export interface CategoryGroup {
  id: string;
  name: string;
  created_at?: string;
}

/**
 * Interface for tag data
 */
export interface Tag {
  id: string;
  name: string;
  color?: string | null;
  created_at?: string;
}

/**
 * Split options for expenses
 */
export type SplitType = 'equal' | 'custom' | 'partner1' | 'partner2';

/**
 * Interface for expense data from database
 */
export interface DbExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  created_at?: string;
  updated_at?: string | null;
  paid_by: string;
  split: Json;
  category_id?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  recurring?: boolean;
  recurring_frequency?: string | null;
  receipt_url?: string | null;
}

/**
 * Interface for expense data for frontend use
 */
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  created_at?: string;
  updated_at?: string | null;
  paidBy: string; // Frontend naming format
  paid_by?: string; // Database naming format
  split: SplitType | Json;
  category_id?: string | null; // Database field
  category?: string; // Frontend compatibility
  tags?: string[] | Tag[] | null;
  notes?: string | null;
  recurring?: boolean;
  recurring_frequency?: string | null;
  receipt_url?: string | null;
}

/**
 * Interface for expense form data
 */
export interface ExpenseFormData extends Omit<Expense, 'id' | 'amount'> {
  amount: string; // Handle amount as string in form state
  isRecurring?: boolean;
  recurringDay?: string;
}
