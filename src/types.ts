export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Make password optional since we're using Firebase Auth
  role: 'partner1' | 'partner2';
  preferences: {
    currency: string;
    favicon?: string;
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
  order: number;
  color?: string;
  icon?: string;
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

// Store types
export interface Store {
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addCategoryGroup: (group: Omit<CategoryGroup, 'id'>) => Promise<void>;
  updateCategoryGroup: (id: string, group: Partial<CategoryGroup>) => Promise<void>;
  deleteCategoryGroup: (id: string) => Promise<void>;
}

export interface UserState {
  currentUser: User | null;
  updateUser: (user: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
