import type { Database } from './supabase';

export type SplitType = 'Equal' | 'No Split';

export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  location_id: string;
  notes: string;
  date: string;
  paid_by: string;
  split_type: SplitType;
  users: {
    name: string;
  };
  created_at: string;
}

export interface ExpenseFilters {
  startDate: string;
  endDate: string;
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  month: string;
  status: 'pending' | 'completed';
  created_at: string;
  updated_at?: string;
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
