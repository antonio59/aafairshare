import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, isSameDay, addMonths, startOfDay } from 'date-fns';
import type { Category, Expense, Tag, RecurringExpense, Budget, Settlement } from '../types';

// Initial categories
const initialCategories: Category[] = [
  // Utilities
  { id: uuidv4(), name: 'Water', color: '#3B82F6', group: 'Utilities' },
  { id: uuidv4(), name: 'Energy', color: '#EF4444', group: 'Utilities' },
  { id: uuidv4(), name: 'Internet', color: '#10B981', group: 'Utilities' },

  // Housing
  { id: uuidv4(), name: 'Rent', color: '#F59E0B', group: 'Housing' },
  { id: uuidv4(), name: 'Council Tax', color: '#6366F1', group: 'Housing' },
  { id: uuidv4(), name: 'House Maintenance/Repairs', color: '#8B5CF6', group: 'Housing' },
  { id: uuidv4(), name: 'Furniture/Appliances', color: '#EC4899', group: 'Housing' },

  // Food
  { id: uuidv4(), name: 'Groceries', color: '#10B981', group: 'Food' },
  { id: uuidv4(), name: 'Dining out', color: '#F97316', group: 'Food' },
  { id: uuidv4(), name: 'Takeout/Delivery', color: '#EF4444', group: 'Food' },
  { id: uuidv4(), name: 'Food Subscriptions', color: '#6366F1', group: 'Food' },

  // Transportation
  { id: uuidv4(), name: 'Flights', color: '#3B82F6', group: 'Transportation' },
  { id: uuidv4(), name: 'Gasoline', color: '#EF4444', group: 'Transportation' },
  { id: uuidv4(), name: 'Public transportation', color: '#10B981', group: 'Transportation' },
  { id: uuidv4(), name: 'Ride-hailing services', color: '#F59E0B', group: 'Transportation' },

  // Insurance
  { id: uuidv4(), name: 'Home Insurance', color: '#6366F1', group: 'Insurance' },
  { id: uuidv4(), name: 'Health Insurance', color: '#EF4444', group: 'Insurance' },
  { id: uuidv4(), name: 'Life Insurance', color: '#10B981', group: 'Insurance' },
  { id: uuidv4(), name: 'Travel Insurance', color: '#F59E0B', group: 'Insurance' },

  // Entertainment
  { id: uuidv4(), name: 'Movies', color: '#3B82F6', group: 'Entertainment' },
  { id: uuidv4(), name: 'Streaming services', color: '#EF4444', group: 'Entertainment' },
  { id: uuidv4(), name: 'Concerts/Events', color: '#10B981', group: 'Entertainment' },
  { id: uuidv4(), name: 'Hobbies', color: '#F59E0B', group: 'Entertainment' },
  { id: uuidv4(), name: 'Holiday', color: '#8B5CF6', group: 'Entertainment' },
  { id: uuidv4(), name: 'Other entertainment', color: '#6366F1', group: 'Entertainment' },

  // Clothing
  { id: uuidv4(), name: 'Clothing purchases', color: '#EC4899', group: 'Clothing' },
  { id: uuidv4(), name: 'Dry cleaning', color: '#8B5CF6', group: 'Clothing' },
  { id: uuidv4(), name: 'Alterations', color: '#6366F1', group: 'Clothing' },

  // Health and wellness
  { id: uuidv4(), name: 'Medical expenses', color: '#EF4444', group: 'Health and wellness' },
  { id: uuidv4(), name: 'Gym membership', color: '#10B981', group: 'Health and wellness' },
  { id: uuidv4(), name: 'Health supplements', color: '#F59E0B', group: 'Health and wellness' },
  { id: uuidv4(), name: 'Wellness services', color: '#8B5CF6', group: 'Health and wellness' },

  // Miscellaneous
  { id: uuidv4(), name: 'Gifts', color: '#EC4899', group: 'Miscellaneous' },
  { id: uuidv4(), name: 'Donations', color: '#6366F1', group: 'Miscellaneous' },
  { id: uuidv4(), name: 'Other miscellaneous expenses', color: '#8B5CF6', group: 'Miscellaneous' },
];

interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Tag actions
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetProgress: (budget: Budget) => number;

  // Recurring expense actions
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;
  processRecurringExpenses: () => void;

  // Settlement actions
  settleMonth: (month: string, settledBy: string, balance: number) => void;
  isMonthSettled: (month: string) => boolean;
  getSettlementDate: (month: string) => string | null;
  getSettlementDetails: (month: string) => Settlement | null;
  getMonthlyBalance: (month: string) => number;
}

const initialState = {
  expenses: [],
  categories: initialCategories,
  tags: [],
  budgets: [],
  recurringExpenses: [],
  settlements: [],
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addExpense: (expense) => {
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: uuidv4() }],
        }));
      },

      updateExpense: (id, updatedExpense) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? { ...expense, ...updatedExpense } : expense
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        }));
      },

      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, { ...category, id: uuidv4() }],
        }));
      },

      updateCategory: (id, updatedCategory) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updatedCategory } : category
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        }));
      },

      addTag: (tag) => {
        set((state) => ({
          tags: [...state.tags, { ...tag, id: uuidv4() }],
        }));
      },

      updateTag: (id, updatedTag) => {
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updatedTag } : tag
          ),
        }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
        }));
      },

      addBudget: (budget) => {
        set((state) => ({
          budgets: [...state.budgets, { ...budget, id: uuidv4() }],
        }));
      },

      updateBudget: (id, updatedBudget) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updatedBudget } : budget
          ),
        }));
      },

      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        }));
      },

      getBudgetProgress: (budget) => {
        const { expenses } = get();
        const currentDate = new Date();
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const relevantExpenses = expenses.filter(
          (expense) => {
            const expenseDate = new Date(expense.date);
            return (
              expense.category === budget.category &&
              expenseDate >= monthStart &&
              expenseDate <= monthEnd
            );
          }
        );

        const totalSpent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        return (totalSpent / budget.amount) * 100;
      },

      addRecurringExpense: (expense) => {
        set((state) => ({
          recurringExpenses: [...state.recurringExpenses, { ...expense, id: uuidv4() }],
        }));
      },

      updateRecurringExpense: (id, updatedExpense) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.map((expense) =>
            expense.id === id ? { ...expense, ...updatedExpense } : expense
          ),
        }));
      },

      deleteRecurringExpense: (id) => {
        set((state) => ({
          recurringExpenses: state.recurringExpenses.filter((expense) => expense.id !== id),
        }));
      },

      processRecurringExpenses: () => {
        const { recurringExpenses, addExpense } = get();
        const today = startOfDay(new Date());

        recurringExpenses.forEach((recurring) => {
          const lastProcessed = recurring.lastProcessed 
            ? startOfDay(new Date(recurring.lastProcessed))
            : null;

          if (!lastProcessed || isAfter(today, addMonths(lastProcessed, 1))) {
            // Create new expense
            const newExpense: Omit<Expense, 'id'> = {
              description: recurring.description,
              amount: recurring.amount,
              category: recurring.category,
              paidBy: recurring.paidBy,
              split: recurring.split,
              date: today.toISOString(),
              tags: recurring.tags,
              recurringId: recurring.id,
            };

            addExpense(newExpense);

            // Update last processed date
            set((state) => ({
              recurringExpenses: state.recurringExpenses.map((exp) =>
                exp.id === recurring.id
                  ? { ...exp, lastProcessed: today.toISOString() }
                  : exp
              ),
            }));
          }
        });
      },

      settleMonth: (month, settledBy, balance) => {
        set((state) => ({
          settlements: [
            ...state.settlements.filter((s) => s.month !== month),
            {
              month,
              settledBy,
              settledAt: new Date().toISOString(),
              balance,
            },
          ],
        }));
      },

      isMonthSettled: (month) => {
        const { settlements } = get();
        return settlements?.some((s) => s.month === month) || false;
      },

      getSettlementDate: (month) => {
        const { settlements } = get();
        const settlement = settlements?.find((s) => s.month === month);
        return settlement ? settlement.settledAt : null;
      },

      getSettlementDetails: (month) => {
        const { settlements } = get();
        return settlements?.find((s) => s.month === month) || null;
      },

      getMonthlyBalance: (month) => {
        const { expenses } = get();
        const monthlyExpenses = expenses.filter(
          (expense) => format(new Date(expense.date), 'yyyy-MM') === month
        );

        return monthlyExpenses.reduce((balance, expense) => {
          if (expense.split === 'equal') {
            return expense.paidBy === 'Andres'
              ? balance + expense.amount / 2
              : balance - expense.amount / 2;
          } else {
            return expense.paidBy === 'Andres'
              ? balance + expense.amount
              : balance - expense.amount;
          }
        }, 0);
      },
    }),
    {
      name: 'expense-store',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Reset to initial state if migrating from version 0
          return initialState;
        }
        return persistedState;
      },
    }
  )
);