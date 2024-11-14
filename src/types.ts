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

export interface BudgetNotificationSetting extends ChanneledNotificationSetting {
  dismissedAlerts?: string[];
}

export interface NotificationPreferences {
  globalEnabled: boolean;
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

export type BudgetActionType = 'created' | 'increased' | 'decreased' | 'deleted';

export interface BudgetHistory {
  id: string;
  budgetId: string;
  actionType: BudgetActionType;
  category: string;
  oldValue?: number;
  newValue?: number;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface BudgetReport {
  startDate: string;
  endDate: string;
  changes: {
    created: number;
    increased: number;
    decreased: number;
    deleted: number;
  };
  categoryTrends: {
    categoryId: string;
    name: string;
    percentageChange: number;
  }[];
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
  id: string;
  month: string;
  settledBy: string;
  settledAt: string;
  balance: number;
  categoryGroups: {
    groupId: string;
    amount: number;
  }[];
  expenses: string[];
  notes?: string;
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

export interface UserStore {
  users: User[];
  currentUser: User | null;
  error: string | null;
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
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
