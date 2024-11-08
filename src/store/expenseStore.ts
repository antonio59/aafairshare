import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, addMonths, startOfDay } from 'date-fns';
import type { Category, Expense, Tag, RecurringExpense, Budget, Settlement } from '../types';
import defaultCategoriesData from '../data/defaultCategories.json';
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

interface State {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
  initialized: boolean;
  error: string | null;
}

interface Actions {
  initializeStore: () => Promise<void>;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  restoreDefaultCategories: () => Promise<void>;
  
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

type ExpenseStore = State & Actions;

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  // Initial state
  expenses: [],
  categories: [],
  tags: [],
  budgets: [],
  recurringExpenses: [],
  settlements: [],
  initialized: false,
  error: null,

  // Actions
  initializeStore: async () => {
    try {
      const data = await fetchAllData();
      set({ 
        ...data, 
        initialized: true,
        error: null 
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ 
        expenses: [],
        categories: [],
        tags: [],
        budgets: [],
        recurringExpenses: [],
        settlements: [],
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to initialize store'
      });
    }
  },

  addExpense: async (expense) => {
    try {
      const newExpense = { ...expense, id: uuidv4() };
      await addExpenseToFirestore(newExpense);
      set((state: State) => ({
        expenses: [...state.expenses, newExpense],
        error: null
      }));
    } catch (error) {
      console.error('Failed to add expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add expense' });
      throw error;
    }
  },

  updateExpense: async (id, updatedExpense) => {
    try {
      await updateExpenseInFirestore(id, updatedExpense);
      set((state: State) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? { ...expense, ...updatedExpense } : expense
        ),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update expense' });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    try {
      await deleteExpenseFromFirestore(id);
      set((state: State) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete expense' });
      throw error;
    }
  },

  addCategory: async (category) => {
    try {
      const newCategory = { ...category, id: uuidv4() };
      await addCategoryToFirestore(newCategory);
      set((state: State) => ({
        categories: [...state.categories, newCategory],
        error: null
      }));
    } catch (error) {
      console.error('Failed to add category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add category' });
      throw error;
    }
  },

  updateCategory: async (id, updatedCategory) => {
    try {
      await updateCategoryInFirestore(id, updatedCategory);
      set((state: State) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, ...updatedCategory } : category
        ),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update category' });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await deleteCategoryFromFirestore(id);
      set((state: State) => ({
        categories: state.categories.filter((category) => category.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete category' });
      throw error;
    }
  },

  restoreDefaultCategories: async () => {
    try {
      // First delete all existing categories
      const { categories } = get();
      for (const category of categories) {
        if (category) {
          await deleteCategoryFromFirestore(category.id);
        }
      }
      
      // Then add all default categories with new IDs
      const defaultCategories = (defaultCategoriesData.categories as Category[]).map(category => ({
        ...category,
        id: uuidv4()
      }));

      for (const category of defaultCategories) {
        await addCategoryToFirestore(category);
      }
      
      set((state: State) => ({
        categories: defaultCategories,
        error: null
      }));
    } catch (error) {
      console.error('Failed to restore default categories:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to restore default categories' });
      throw error;
    }
  },

  addTag: async (tag) => {
    try {
      const newTag = { ...tag, id: uuidv4() };
      await addTagToFirestore(newTag);
      set((state: State) => ({
        tags: [...state.tags, newTag],
        error: null
      }));
    } catch (error) {
      console.error('Failed to add tag:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add tag' });
      throw error;
    }
  },

  updateTag: async (id, updatedTag) => {
    try {
      await updateTagInFirestore(id, updatedTag);
      set((state: State) => ({
        tags: state.tags.map((tag) =>
          tag.id === id ? { ...tag, ...updatedTag } : tag
        ),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update tag:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update tag' });
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      await deleteTagFromFirestore(id);
      set((state: State) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete tag:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete tag' });
      throw error;
    }
  },

  addBudget: async (budget) => {
    try {
      const newBudget = { ...budget, id: uuidv4() };
      await addBudgetToFirestore(newBudget);
      set((state: State) => ({
        budgets: [...state.budgets, newBudget],
        error: null
      }));
    } catch (error) {
      console.error('Failed to add budget:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add budget' });
      throw error;
    }
  },

  updateBudget: async (id, updatedBudget) => {
    try {
      await updateBudgetInFirestore(id, updatedBudget);
      set((state: State) => ({
        budgets: state.budgets.map((budget) =>
          budget.id === id ? { ...budget, ...updatedBudget } : budget
        ),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update budget:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update budget' });
      throw error;
    }
  },

  deleteBudget: async (id) => {
    try {
      await deleteBudgetFromFirestore(id);
      set((state: State) => ({
        budgets: state.budgets.filter((budget) => budget.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete budget:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete budget' });
      throw error;
    }
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
    try {
      const newExpense = { ...expense, id: uuidv4() };
      await addRecurringExpenseToFirestore(newExpense);
      set((state: State) => ({
        recurringExpenses: [...state.recurringExpenses, newExpense],
        error: null
      }));
    } catch (error) {
      console.error('Failed to add recurring expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add recurring expense' });
      throw error;
    }
  },

  updateRecurringExpense: async (id, updatedExpense) => {
    try {
      await updateRecurringExpenseInFirestore(id, updatedExpense);
      set((state: State) => ({
        recurringExpenses: state.recurringExpenses.map((expense) =>
          expense.id === id ? { ...expense, ...updatedExpense } : expense
        ),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update recurring expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update recurring expense' });
      throw error;
    }
  },

  deleteRecurringExpense: async (id) => {
    try {
      await deleteRecurringExpenseFromFirestore(id);
      set((state: State) => ({
        recurringExpenses: state.recurringExpenses.filter((expense) => expense.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete recurring expense' });
      throw error;
    }
  },

  processRecurringExpenses: async () => {
    try {
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
      set({ error: null });
    } catch (error) {
      console.error('Failed to process recurring expenses:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to process recurring expenses' });
      throw error;
    }
  },

  settleMonth: async (month, settledBy, balance) => {
    try {
      const settlement = {
        month,
        settledBy,
        settledAt: new Date().toISOString(),
        balance,
      };
      await addSettlementToFirestore(settlement);
      set((state: State) => ({
        settlements: [
          ...state.settlements.filter((s) => s.month !== month),
          settlement,
        ],
        error: null
      }));
    } catch (error) {
      console.error('Failed to settle month:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to settle month' });
      throw error;
    }
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
