import type { User, Category, CategoryGroup, Tag, Budget, Expense, RecurringExpense, Settlement } from '../types';

export interface UserStore {
  currentUser: User | null;
  isInitialized: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  setInitialized: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
  initialized: boolean;
  error: string | null;
  isLoading: boolean;

  // Initialization
  setLoading: (value: boolean) => void;
  initializeStore: () => Promise<void>;

  // Expense operations
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Category operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Category Group operations
  addCategoryGroup: (group: Omit<CategoryGroup, 'id'>) => Promise<void>;
  updateCategoryGroup: (id: string, group: Partial<CategoryGroup>) => Promise<void>;
  deleteCategoryGroup: (id: string) => Promise<void>;

  // Tag operations
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // Budget operations
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetProgress: (budget: Budget) => number;

  // Recurring Expense operations
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => Promise<void>;
  updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  processRecurringExpenses: () => Promise<void>;

  // Settlement operations
  settleMonth: (month: string, settledBy: string, balance: number) => Promise<void>;
  isMonthSettled: (month: string) => boolean;
  getSettlementDate: (month: string) => string | null;
  getSettlementDetails: (month: string) => Settlement | null;
  getMonthlyBalance: (month: string) => number;
}
