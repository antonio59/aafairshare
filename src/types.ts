export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'partner1' | 'partner2';
  preferences: {
    currency: string;
    notifications: {
      overBudget: boolean;
      monthlyReminder: boolean;
      monthEndReminder: boolean;
      monthlyAnalytics: boolean;
    };
  };
}

export interface Tag {
  id: string;
  name: string;
  categoryId?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  groupId: string;
  icon?: string;
}

export interface RecurringExpense {
  id: string;
  description?: string;
  amount: number;
  category: string;
  paidBy: string;
  split: 'equal' | 'no-split';
  startDate: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth: number;
  tags: string[];
  lastProcessed?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
}

export interface Expense {
  id: string;
  description?: string;
  amount: number;
  date: string;
  category: string;
  paidBy: string;
  split: 'equal' | 'no-split';
  tags: string[];
  recurringId?: string;
}

export interface Settlement {
  month: string;
  settledBy: string;
  settledAt: string;
  balance: number;
}
