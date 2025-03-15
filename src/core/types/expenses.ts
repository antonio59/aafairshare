/**
 * Type definitions for expenses
 */

export interface Expense {
  id?: string;
  date: string;
  amount: number;
  category_id: string | null;
  notes?: string | null;
  location_id: string | null;
  paid_by: string | null;
  split_type: 'equal' | 'none' | string;
  _category?: string;
  _location?: string;
  _all_locations?: string[];
  paid_by_name?: string | null;
}

export interface ExpenseCreate extends Omit<Expense, 'id'> {
  currency?: string;
}

export interface ExpenseUpdate extends Partial<ExpenseCreate> {
  id: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  locations?: string[];
  paidBy?: string[];
  minAmount?: number;
  maxAmount?: number;
  splitType?: string[];
}