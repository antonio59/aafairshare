export interface User {
  id: string;
  email: string;
  name: string;
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
  description?: string | null;
  amount: number;
  category_id: string | null;
  category?: string; // For backward compatibility
  paid_by: string;
  paidBy?: string; // For backward compatibility
  split: any; // Json type
  start_date: string;
  startDate?: string; // For backward compatibility
  frequency: string; // 'monthly' | 'quarterly' | 'yearly' | 'weekly'
  day_of_month: number;
  dayOfMonth?: number; // For backward compatibility
  tags: string[] | null;
  last_processed?: string | null;
  lastProcessed?: string; // For backward compatibility
  next_due_date?: string | null;
  created_at?: string;
  updated_at?: string | null;
  user_id?: string | null;
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

export interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  paidBy: string;
  split: 'equal' | 'no-split';
  tags: string[];
  receipt?: File | null;
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
  date: string;
  paidBy: string;
  paidTo: string;
  amount: number;
  status: 'pending' | 'completed';
  month?: string;
  settledBy?: string;
  settledAt?: string;
  balance?: number;
  categoryGroups?: {
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
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
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

export interface BudgetHistoryFilters {
  startDate?: string;
  endDate?: string;
  actionTypes?: BudgetActionType[];
  categories?: string[];
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notificationFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultSplit: 'equal' | 'no-split';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    recurring: boolean;
  };
}

export interface SettlementSummary {
  id: string;
  date: string;
  amount: number;
  paidBy: string;
  paidTo: string;
  notes?: string;
  status: 'pending' | 'completed';
  expenses: Expense[];
}
