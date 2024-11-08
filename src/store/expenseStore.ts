import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, addMonths, startOfDay } from 'date-fns';
import type { Category, Expense, Tag, RecurringExpense, Budget, Settlement } from '../types';
import {
  addExpenseToFirestore,
  updateExpenseInFirestore,
  deleteExpenseFromFirestore,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  addTagToFirestore,
  updateTagInFirestore,
  deleteTagFromFirestore,
  addBudgetToFirestore,
  updateBudgetInFirestore,
  deleteBudgetFromFirestore,
  addRecurringExpenseToFirestore,
  updateRecurringExpenseInFirestore,
  deleteRecurringExpenseFromFirestore,
  addSettlementToFirestore,
  fetchAllData
} from './firebaseOperations';

// Initial categories remain the same
const initialCategories: Category[] = [
  // ... (previous categories array remains unchanged)
];

interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
  initialized: boolean;
  
  initializeStore: () => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Tag actions
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // Budget actions
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetProgress: (budget: Budget) => number;

  // Recurring expense actions
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => Promise<void>;
  updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  processRecurringExpenses: () => Promise<void>;

  // Settlement actions
  settleMonth: (month: string, settledBy: string, balance: number) => Promise<void>;
  isMonthSettled: (month: string) => boolean;
  getSettlementDate: (month: string) => string | null;
  getSettlementDetails: (month: string) => Settlement | null;
  getMonthlyBalance: (month: string) => number;
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenses: [],
  categories: initialCategories,
  tags: [],
  budgets: [],
  recurringExpenses: [],
  settlements: [],
  initialized: false,

  initializeStore: async () => {
    try {
      const data = await fetchAllData();
      set({ ...data, initialized: true });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ initialized: true }); // Set initialized even on error to prevent infinite loading
    }
  },

  addExpense: async (expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addExpenseToFirestore(newExpense);
    set((state) => ({
      expenses: [...state.expenses, newExpense],
    }));
  },

  updateExpense: async (id, updatedExpense) => {
    await updateExpenseInFirestore(id, updatedExpense);
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      ),
    }));
  },

  deleteExpense: async (id) => {
    await deleteExpenseFromFirestore(id);
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
    }));
  },

  addCategory: async (category) => {
    const newCategory = { ...category, id: uuidv4() };
    await addCategoryToFirestore(newCategory);
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },

  updateCategory: async (id, updatedCategory) => {
    await updateCategoryInFirestore(id, updatedCategory);
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, ...updatedCategory } : category
      ),
    }));
  },

  deleteCategory: async (id) => {
    await deleteCategoryFromFirestore(id);
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }));
  },

  addTag: async (tag) => {
    const newTag = { ...tag, id: uuidv4() };
    await addTagToFirestore(newTag);
    set((state) => ({
      tags: [...state.tags, newTag],
    }));
  },

  updateTag: async (id, updatedTag) => {
    await updateTagInFirestore(id, updatedTag);
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updatedTag } : tag
      ),
    }));
  },

  deleteTag: async (id) => {
    await deleteTagFromFirestore(id);
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
    }));
  },

  addBudget: async (budget) => {
    const newBudget = { ...budget, id: uuidv4() };
    await addBudgetToFirestore(newBudget);
    set((state) => ({
      budgets: [...state.budgets, newBudget],
    }));
  },

  updateBudget: async (id, updatedBudget) => {
    await updateBudgetInFirestore(id, updatedBudget);
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.id === id ? { ...budget, ...updatedBudget } : budget
      ),
    }));
  },

  deleteBudget: async (id) => {
    await deleteBudgetFromFirestore(id);
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

  addRecurringExpense: async (expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addRecurringExpenseToFirestore(newExpense);
    set((state) => ({
      recurringExpenses: [...state.recurringExpenses, newExpense],
    }));
  },

  updateRecurringExpense: async (id, updatedExpense) => {
    await updateRecurringExpenseInFirestore(id, updatedExpense);
    set((state) => ({
      recurringExpenses: state.recurringExpenses.map((expense) =>
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      ),
    }));
  },

  deleteRecurringExpense: async (id) => {
    await deleteRecurringExpenseFromFirestore(id);
    set((state) => ({
      recurringExpenses: state.recurringExpenses.filter((expense) => expense.id !== id),
    }));
  },

  processRecurringExpenses: async () => {
    const { recurringExpenses, addExpense } = get();
    const today = startOfDay(new Date());

    for (const recurring of recurringExpenses) {
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

        await addExpense(newExpense);

        // Update last processed date
        await get().updateRecurringExpense(recurring.id, {
          lastProcessed: today.toISOString()
        });
      }
    }
  },

  settleMonth: async (month, settledBy, balance) => {
    const settlement = {
      month,
      settledBy,
      settledAt: new Date().toISOString(),
      balance,
    };
    await addSettlementToFirestore(settlement);
    set((state) => ({
      settlements: [
        ...state.settlements.filter((s) => s.month !== month),
        settlement,
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
}));
