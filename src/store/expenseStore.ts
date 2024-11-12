import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, addMonths, startOfDay } from 'date-fns';
import type { Expense, RecurringExpense, Budget, Settlement } from '../types';
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
import type { ExpenseStore } from './types';
import { getExpenseStore } from './createStore';

const initialState = {
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

const createExpenseStore: StateCreator<ExpenseStore> = (set, get) => ({
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

  addExpense: async (expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addExpenseToFirestore(newExpense);
    set(state => ({ expenses: [...state.expenses, newExpense], error: null }));
  },

  updateExpense: async (id, expense) => {
    await updateExpenseInFirestore(id, expense);
    set(state => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...expense } : e),
      error: null
    }));
  },

  deleteExpense: async (id) => {
    await deleteExpenseFromFirestore(id);
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id),
      error: null
    }));
  },

  addCategory: async (category) => {
    const newCategory = { ...category, id: uuidv4() };
    await addCategoryToFirestore(newCategory);
    set(state => ({ categories: [...state.categories, newCategory], error: null }));
  },

  updateCategory: async (id, category) => {
    await updateCategoryInFirestore(id, category);
    set(state => ({
      categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c),
      error: null
    }));
  },

  deleteCategory: async (id) => {
    await deleteCategoryFromFirestore(id);
    set(state => ({
      categories: state.categories.filter(c => c.id !== id),
      error: null
    }));
  },

  addCategoryGroup: async (group) => {
    const newGroup = { ...group, id: uuidv4() };
    await addCategoryGroupToFirestore(newGroup);
    set(state => ({ categoryGroups: [...state.categoryGroups, newGroup], error: null }));
  },

  updateCategoryGroup: async (id, group) => {
    await updateCategoryGroupInFirestore(id, group);
    set(state => ({
      categoryGroups: state.categoryGroups.map(g => g.id === id ? { ...g, ...group } : g),
      error: null
    }));
  },

  deleteCategoryGroup: async (id) => {
    await deleteCategoryGroupFromFirestore(id);
    set(state => ({
      categoryGroups: state.categoryGroups.filter(g => g.id !== id),
      error: null
    }));
  },

  addTag: async (tag) => {
    const { tags } = get();
    const existingTag = tags.find(t => t.name.toLowerCase() === tag.name.toLowerCase());
    
    if (existingTag) {
      if (existingTag.categoryId !== tag.categoryId) {
        await get().updateTag(existingTag.id, { categoryId: tag.categoryId });
      }
      return;
    }

    const newTag = { ...tag, id: uuidv4() };
    await addTagToFirestore(newTag);
    set(state => ({ tags: [...state.tags, newTag], error: null }));
  },

  updateTag: async (id, tag) => {
    await updateTagInFirestore(id, tag);
    set(state => ({
      tags: state.tags.map(t => t.id === id ? { ...t, ...tag } : t),
      error: null
    }));
  },

  deleteTag: async (id) => {
    await deleteTagFromFirestore(id);
    set(state => ({
      tags: state.tags.filter(t => t.id !== id),
      error: null
    }));
  },

  addBudget: async (budget) => {
    const newBudget = { ...budget, id: uuidv4() };
    await addBudgetToFirestore(newBudget);
    set(state => ({ budgets: [...state.budgets, newBudget], error: null }));
  },

  updateBudget: async (id, budget) => {
    await updateBudgetInFirestore(id, budget);
    set(state => ({
      budgets: state.budgets.map(b => b.id === id ? { ...b, ...budget } : b),
      error: null
    }));
  },

  deleteBudget: async (id) => {
    await deleteBudgetFromFirestore(id);
    set(state => ({
      budgets: state.budgets.filter(b => b.id !== id),
      error: null
    }));
  },

  getBudgetProgress: (budget: Budget) => {
    const { expenses } = get();
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const relevantExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.category === budget.category &&
             expenseDate >= monthStart &&
             expenseDate <= monthEnd;
    });

    const totalSpent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return (totalSpent / budget.amount) * 100;
  },

  addRecurringExpense: async (expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addRecurringExpenseToFirestore(newExpense);
    set(state => ({ recurringExpenses: [...state.recurringExpenses, newExpense], error: null }));
  },

  updateRecurringExpense: async (id, expense) => {
    await updateRecurringExpenseInFirestore(id, expense);
    set(state => ({
      recurringExpenses: state.recurringExpenses.map(e => e.id === id ? { ...e, ...expense } : e),
      error: null
    }));
  },

  deleteRecurringExpense: async (id) => {
    await deleteRecurringExpenseFromFirestore(id);
    set(state => ({
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

  settleMonth: async (month, settledBy, balance) => {
    const settlement = {
      month,
      settledBy,
      settledAt: new Date().toISOString(),
      balance,
    };
    await addSettlementToFirestore(settlement);
    set(state => ({
      settlements: [...state.settlements.filter(s => s.month !== month), settlement],
      error: null
    }));
  },

  isMonthSettled: (month) => {
    const { settlements } = get();
    return settlements.some(s => s.month === month);
  },

  getSettlementDate: (month) => {
    const { settlements } = get();
    const settlement = settlements.find(s => s.month === month);
    return settlement ? settlement.settledAt : null;
  },

  getSettlementDetails: (month) => {
    const { settlements } = get();
    return settlements.find(s => s.month === month) || null;
  },

  getMonthlyBalance: (month) => {
    const { expenses } = get();
    const monthlyExpenses = expenses.filter(
      expense => format(new Date(expense.date), 'yyyy-MM') === month
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
  }
});

// Export the store hook
export const useExpenseStore = getExpenseStore(createExpenseStore);
