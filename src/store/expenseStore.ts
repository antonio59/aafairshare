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
  fetchAllData
} from './firebaseOperations';
import { auth } from '../firebase';
import { reAuthenticateUser } from '../utils/authUtils';

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
  isLoading: boolean;
}

interface Actions {
  initializeStore: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCategoryGroup: (group: Omit<CategoryGroup, 'id'>) => Promise<void>;
  updateCategoryGroup: (id: string, group: Partial<CategoryGroup>) => Promise<void>;
  deleteCategoryGroup: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudgetProgress: (budget: Budget) => number;
  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => Promise<void>;
  updateRecurringExpense: (id: string, expense: Partial<RecurringExpense>) => Promise<void>;
  deleteRecurringExpense: (id: string) => Promise<void>;
  processRecurringExpenses: () => Promise<void>;
  settleMonth: (month: string, settledBy: string, balance: number) => Promise<void>;
  isMonthSettled: (month: string) => boolean;
  getSettlementDate: (month: string) => string | null;
  getSettlementDetails: (month: string) => Settlement | null;
  getMonthlyBalance: (month: string) => number;
  setLoading: (value: boolean) => void;
}

const initialState: State = {
  expenses: [],
  categories: [],
  categoryGroups: [],
  tags: [],
  budgets: [],
  recurringExpenses: [],
  settlements: [],
  initialized: false,
  error: null,
  isLoading: false
};

type Store = State & Actions;

const store = (set: any, get: any): Store => ({
  ...initialState,

  setLoading: (value: boolean) => {
    set({ isLoading: value });
  },

  initializeStore: async () => {
    const store = get();
    if (store.initialized || store.isLoading) return;

    store.setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        const data = await fetchAllData();
        set({ 
          ...data, 
          initialized: true,
          error: null,
          isLoading: false 
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission-denied')) {
          try {
            const storedEmail = user.email;
            if (!storedEmail) {
              throw new Error('No email found for re-authentication');
            }
            await reAuthenticateUser(storedEmail);
            const data = await fetchAllData();
            set({ 
              ...data, 
              initialized: true,
              error: null,
              isLoading: false 
            });
          } catch (reAuthError) {
            console.error('Re-authentication failed:', reAuthError);
            throw reAuthError;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ 
        ...initialState,
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to initialize store',
        isLoading: false
      });
      throw error;
    }
  },

  addExpense: async (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addExpenseToFirestore(newExpense);
    set((state: State) => ({ expenses: [...state.expenses, newExpense], error: null }));
  },

  updateExpense: async (id: string, expense: Partial<Expense>) => {
    await updateExpenseInFirestore(id, expense);
    set((state: State) => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...expense } : e),
      error: null
    }));
  },

  deleteExpense: async (id: string) => {
    await deleteExpenseFromFirestore(id);
    set((state: State) => ({
      expenses: state.expenses.filter(e => e.id !== id),
      error: null
    }));
  },

  addCategory: async (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: uuidv4() };
    await addCategoryToFirestore(newCategory);
    set((state: State) => ({ categories: [...state.categories, newCategory], error: null }));
  },

  updateCategory: async (id: string, category: Partial<Category>) => {
    await updateCategoryInFirestore(id, category);
    set((state: State) => ({
      categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c),
      error: null
    }));
  },

  deleteCategory: async (id: string) => {
    await deleteCategoryFromFirestore(id);
    set((state: State) => ({
      categories: state.categories.filter(c => c.id !== id),
      error: null
    }));
  },

  addCategoryGroup: async (group: Omit<CategoryGroup, 'id'>) => {
    const newGroup = { ...group, id: uuidv4() };
    await addCategoryGroupToFirestore(newGroup);
    set((state: State) => ({ categoryGroups: [...state.categoryGroups, newGroup], error: null }));
  },

  updateCategoryGroup: async (id: string, group: Partial<CategoryGroup>) => {
    await updateCategoryGroupInFirestore(id, group);
    set((state: State) => ({
      categoryGroups: state.categoryGroups.map(g => g.id === id ? { ...g, ...group } : g),
      error: null
    }));
  },

  deleteCategoryGroup: async (id: string) => {
    await deleteCategoryGroupFromFirestore(id);
    set((state: State) => ({
      categoryGroups: state.categoryGroups.filter(g => g.id !== id),
      error: null
    }));
  },

  addTag: async (tag: Omit<Tag, 'id'>) => {
    const { tags } = get();
    const existingTag = tags.find((t: Tag) => t.name.toLowerCase() === tag.name.toLowerCase());
    
    if (existingTag) {
      if (existingTag.categoryId !== tag.categoryId) {
        await get().updateTag(existingTag.id, { categoryId: tag.categoryId });
      }
      return;
    }

    const newTag = { ...tag, id: uuidv4() };
    await addTagToFirestore(newTag);
    set((state: State) => ({ tags: [...state.tags, newTag], error: null }));
  },

  updateTag: async (id: string, tag: Partial<Tag>) => {
    await updateTagInFirestore(id, tag);
    set((state: State) => ({
      tags: state.tags.map(t => t.id === id ? { ...t, ...tag } : t),
      error: null
    }));
  },

  deleteTag: async (id: string) => {
    await deleteTagFromFirestore(id);
    set((state: State) => ({
      tags: state.tags.filter(t => t.id !== id),
      error: null
    }));
  },

  addBudget: async (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: uuidv4() };
    await addBudgetToFirestore(newBudget);
    set((state: State) => ({ budgets: [...state.budgets, newBudget], error: null }));
  },

  updateBudget: async (id: string, budget: Partial<Budget>) => {
    await updateBudgetInFirestore(id, budget);
    set((state: State) => ({
      budgets: state.budgets.map(b => b.id === id ? { ...b, ...budget } : b),
      error: null
    }));
  },

  deleteBudget: async (id: string) => {
    await deleteBudgetFromFirestore(id);
    set((state: State) => ({
      budgets: state.budgets.filter(b => b.id !== id),
      error: null
    }));
  },

  getBudgetProgress: (budget: Budget) => {
    const { expenses } = get();
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const relevantExpenses = expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date);
      return expense.category === budget.category &&
             expenseDate >= monthStart &&
             expenseDate <= monthEnd;
    });

    const totalSpent = relevantExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    return (totalSpent / budget.amount) * 100;
  },

  addRecurringExpense: async (expense: Omit<RecurringExpense, 'id'>) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addRecurringExpenseToFirestore(newExpense);
    set((state: State) => ({ recurringExpenses: [...state.recurringExpenses, newExpense], error: null }));
  },

  updateRecurringExpense: async (id: string, expense: Partial<RecurringExpense>) => {
    await updateRecurringExpenseInFirestore(id, expense);
    set((state: State) => ({
      recurringExpenses: state.recurringExpenses.map(e => e.id === id ? { ...e, ...expense } : e),
      error: null
    }));
  },

  deleteRecurringExpense: async (id: string) => {
    await deleteRecurringExpenseFromFirestore(id);
    set((state: State) => ({
      recurringExpenses: state.recurringExpenses.filter(e => e.id !== id),
      error: null
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
        await get().updateRecurringExpense(recurring.id, {
          lastProcessed: today.toISOString()
        });
      }
    }
  },

  settleMonth: async (month: string, settledBy: string, balance: number) => {
    const settlement = {
      month,
      settledBy,
      settledAt: new Date().toISOString(),
      balance,
    };
    await addSettlementToFirestore(settlement);
    set((state: State) => ({
      settlements: [...state.settlements.filter((s: Settlement) => s.month !== month), settlement],
      error: null
    }));
  },

  isMonthSettled: (month: string) => {
    const { settlements } = get();
    return settlements.some((s: Settlement) => s.month === month);
  },

  getSettlementDate: (month: string) => {
    const { settlements } = get();
    const settlement = settlements.find((s: Settlement) => s.month === month);
    return settlement ? settlement.settledAt : null;
  },

  getSettlementDetails: (month: string) => {
    const { settlements } = get();
    return settlements.find((s: Settlement) => s.month === month) || null;
  },

  getMonthlyBalance: (month: string) => {
    const { expenses } = get();
    const monthlyExpenses = expenses.filter(
      (expense: Expense) => format(new Date(expense.date), 'yyyy-MM') === month
    );

    return monthlyExpenses.reduce((balance: number, expense: Expense) => {
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
  }
});

export const useExpenseStore = create<Store>()(store);
