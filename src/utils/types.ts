export interface Expense {
  id: string;
  amount: number;
  category_id: string;
  location_id: string;
  notes: string;
  date: string;
  paid_by: string;
  split_type: 'Equal' | 'No Split';
  users: {
    name: string;
  };
  created_at: string;
}

export interface Category {
  id: string;
  category: string;
}

export interface Location {
  id: string;
  location: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}