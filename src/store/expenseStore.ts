import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, addMonths, startOfDay } from 'date-fns';
import type { Category, CategoryGroup, Expense, Tag, RecurringExpense, Budget, Settlement } from '../types';
import {
  addExpenseToFirestore,
  updateExpenseInFirestore,
  deleteExpenseFromFirestore,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  addCategoryGroupToFirestore,
  updateCategoryGroupInFirestore,
  deleteCategoryGroupFromFirestore,
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
  fetchAllData,
  type FirestoreData
} from './firebaseOperations';

interface State {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
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

  // Category Group actions
  addCategoryGroup: (group: Omit<CategoryGroup, 'id'>) => Promise<void>;
  updateCategoryGroup: (id: string, group: Partial<CategoryGroup>) => Promise<void>;
  deleteCategoryGroup: (id: string) => Promise<void>;
  
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

type Store = State & Actions;

export const useExpenseStore = create<Store>((set, get) => ({
  // Initial state
  expenses: [],
  categories: [],
  categoryGroups: [],
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
        categoryGroups: [],
        tags: [],
        budgets: [],
        recurringExpenses: [],
        settlements: [],
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to initialize store'
      });
    }
  },

  // Category Group actions
  addCategoryGroup: async (group) => {
    try {
      const newGroup = { ...group, id: uuidv4() };
      await addCategoryGroupToFirestore(newGroup);
      set((state) => ({
        categoryGroups: [...state.categoryGroups, newGroup],
        error: null
      }));
    } catch (error) {
      console.error('Failed to add category group:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add category group' });
      throw error;
    }
  },

  updateCategoryGroup: async (id, updatedGroup) => {
    try {
      await updateCategoryGroupInFirestore(id, updatedGroup);
      set((state) => ({
        categoryGroups: state.categoryGroups.map((group) =>
          group.id === id ? { ...group, ...updatedGroup } : group
        ),
        error: null
      }));
    } catch (error) {
      console.error('Failed to update category group:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update category group' });
      throw error;
    }
  },

  deleteCategoryGroup: async (id) => {
    try {
      await deleteCategoryGroupFromFirestore(id);
      set((state) => ({
        categoryGroups: state.categoryGroups.filter((group) => group.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete category group:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete category group' });
      throw error;
    }
  },

  // Category actions
  addCategory: async (category) => {
    try {
      const newCategory = { ...category, id: uuidv4() };
      await addCategoryToFirestore(newCategory);
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete category:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete category' });
      throw error;
    }
  },

  // Tag actions
  addTag: async (tag) => {
    try {
      // Check if a tag with the same name already exists (case-insensitive)
      const { tags } = get();
      const existingTag = tags.find(t => t.name.toLowerCase() === tag.name.toLowerCase());
      
      if (existingTag) {
        // If tag exists and has different categoryId, update it
        if (existingTag.categoryId !== tag.categoryId) {
          await get().updateTag(existingTag.id, { categoryId: tag.categoryId });
        }
        return;
      }

      const newTag = { ...tag, id: uuidv4() };
      await addTagToFirestore(newTag);
      set((state) => ({
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
      // Check if a tag with the same name already exists (case-insensitive)
      const { tags } = get();
      const currentTag = tags.find(t => t.id === id);
      if (!currentTag) throw new Error('Tag not found');

      const existingTag = tags.find(t => 
        t.id !== id && 
        t.name.toLowerCase() === (updatedTag.name?.toLowerCase() || currentTag.name.toLowerCase())
      );

      if (existingTag) {
        // If a tag with the same name exists, update its categoryId if needed
        if (updatedTag.categoryId && existingTag.categoryId !== updatedTag.categoryId) {
          await updateTagInFirestore(existingTag.id, { categoryId: updatedTag.categoryId });
          set((state) => ({
            tags: state.tags.map((t) =>
              t.id === existingTag.id ? { ...t, categoryId: updatedTag.categoryId } : t
            ),
            error: null
          }));
        }
        // Delete the current tag as we're using the existing one
        await deleteTagFromFirestore(id);
        set((state) => ({
          tags: state.tags.filter((t) => t.id !== id),
          error: null
        }));
        return;
      }

      // If no existing tag with the same name, proceed with update
      await updateTagInFirestore(id, updatedTag);
      set((state) => ({
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
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete tag:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete tag' });
      throw error;
    }
  },

  // Budget actions
  addBudget: async (budget) => {
    try {
      const newBudget = { ...budget, id: uuidv4() };
      await addBudgetToFirestore(newBudget);
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
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

  // Recurring expense actions
  addRecurringExpense: async (expense) => {
    try {
      const newExpense = { ...expense, id: uuidv4() };
      await addRecurringExpenseToFirestore(newExpense);
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
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

  // Settlement actions
  settleMonth: async (month, settledBy, balance) => {
    try {
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

  // Expense actions
  addExpense: async (expense) => {
    try {
      const newExpense = { ...expense, id: uuidv4() };
      await addExpenseToFirestore(newExpense);
      set((state) => ({
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
      set((state) => ({
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
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
        error: null
      }));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete expense' });
      throw error;
    }
  },
}));
