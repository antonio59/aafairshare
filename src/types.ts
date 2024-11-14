export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'partner1' | 'partner2';
  preferences: {
    currency: string;
    notifications: NotificationPreferences;
  };
}

export interface BaseNotificationSetting {
  enabled: boolean;
}

export interface TimedNotificationSetting extends BaseNotificationSetting {
  time?: string;
}

export interface ChanneledNotificationSetting extends BaseNotificationSetting {
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

// Updated to include email and in-app options
export interface BudgetNotificationSetting extends ChanneledNotificationSetting {
  dismissedAlerts?: string[];
}

export interface NotificationPreferences {
  // Global notification toggle
  globalEnabled: boolean;
  // Updated notification types
  overBudget: BudgetNotificationSetting;
  monthlyReminder: TimedNotificationSetting;
  settlementNotifications: ChanneledNotificationSetting;
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
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
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
  id: string;  // Added unique ID for each settlement
  month: string;
  settledBy: string;
  settledAt: string;
  balance: number;
  categoryGroups: {  // Added to track settlements by category groups
    groupId: string;
    amount: number;
  }[];
  expenses: string[];  // Added to track which expenses were included
  notes?: string;  // Added for optional settlement notes
}

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

export interface NotificationAlert {
  id: string;
  type: 'overBudget' | 'monthlyReminder' | 'settlement';
  title: string;
  message: string;
  timestamp: string;
  category?: string;
  amount?: number;
  dismissed?: boolean;
}
