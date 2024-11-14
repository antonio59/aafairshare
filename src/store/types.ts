import type { 
  Expense, 
  Category, 
  CategoryGroup, 
  Tag, 
  Budget, 
  RecurringExpense, 
  Settlement,
  BudgetHistory,
  BudgetReport,
  BudgetHistoryFilters
} from '@/types';

export interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  budgets: Budget[];
  budgetHistory: BudgetHistory[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
  initialized: boolean;
  error: string | null;
  isLoading: boolean;
  lastFetchTimestamp: number | null;

  // Store initialization
  setLoading: (value: boolean) => void;
  initializeStore: () => Promise<void>;

  // Budget operations
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetProgress: (budget: Budget) => number;

  // Budget History operations
  getBudgetHistory: (filters?: BudgetHistoryFilters) => BudgetHistory[];
  generateBudgetReport: (startDate: string, endDate: string) => BudgetReport;

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

  // Recurring Expense operations
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => Promise<void>;
  updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  processRecurringExpenses: () => Promise<void>;

  // Expense operations
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Settlement operations
  settleMonth: (month: string, settledBy: string, balance: number) => Promise<void>;
  isMonthSettled: (month: string) => boolean;
  getSettlementDate: (month: string) => string | null;
  getSettlementDetails: (month: string) => Settlement | null;
  getMonthlyBalance: (month: string) => number;
}
