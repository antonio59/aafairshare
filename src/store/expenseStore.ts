import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { format, isAfter, addMonths, startOfDay, parseISO, isWithinInterval } from 'date-fns';
import type { 
  Expense, 
  RecurringExpense, 
  Budget, 
  Settlement, 
  BudgetHistory, 
  BudgetReport, 
  BudgetActionType,
  Category,
  CategoryGroup,
  Tag
} from '@/types';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  addCategory,
  updateCategory,
  deleteCategory,
  addCategoryGroup,
  updateCategoryGroup,
  deleteCategoryGroup,
  addTag,
  updateTag,
  deleteTag,
  addBudget,
  updateBudget,
  deleteBudget,
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  addSettlement,
  addBudgetHistory,
  fetchAllData
} from '@/store/supabaseOperations';
import { supabaseClient } from '@/supabase';
import { reAuthenticateUser } from '@/utils/authUtils';
import type { ExpenseStore } from '@/store/types';
import { getExpenseStore } from '@/store/createStore';

const initialState = {
  expenses: [] as Expense[],
  categories: [] as Category[],
  categoryGroups: [] as CategoryGroup[],
  tags: [] as Tag[],
  budgets: [] as Budget[],
  budgetHistory: [] as BudgetHistory[],
  recurringExpenses: [] as RecurringExpense[],
  settlements: [] as Settlement[],
  initialized: false,
  error: null as string | null,
  isLoading: false,
  lastFetchTimestamp: null as number | null
};

const FETCH_COOLDOWN = 5000;

const createExpenseStore: StateCreator<ExpenseStore> = (set, get) => ({
  ...initialState,

  setLoading: (value: boolean) => {
    set({ isLoading: value });
  },

  initializeStore: async () => {
    const store = get();
    if (store.isLoading) return;

    const now = Date.now();
    if (store.lastFetchTimestamp && (now - store.lastFetchTimestamp < FETCH_COOLDOWN)) {
      console.log('Skipping fetch due to cooldown');
      return;
    }

    store.setLoading(true);
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const existingData = {
        expenses: store.expenses,
        categories: store.categories,
        categoryGroups: store.categoryGroups,
        tags: store.tags,
        budgets: store.budgets,
        budgetHistory: store.budgetHistory,
        recurringExpenses: store.recurringExpenses,
        settlements: store.settlements,
      };

      try {
        const data = await fetchAllData();
        if (data && Object.keys(data).length > 0) {
          console.log('Fetched data:', data);
          set({ 
            ...data, 
            initialized: true,
            error: null,
            isLoading: false,
            lastFetchTimestamp: now
          });
        } else {
          console.warn('Received empty data from database, keeping existing data');
          set({
            ...existingData,
            initialized: true,
            error: null,
            isLoading: false,
            lastFetchTimestamp: now
          });
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission-denied')) {
          try {
            const storedEmail = user.email;
            if (!storedEmail) {
              throw new Error('No email found for re-authentication');
            }
            await reAuthenticateUser(storedEmail);
            const data = await fetchAllData();
            if (data && Object.keys(data).length > 0) {
              console.log('Fetched data after re-auth:', data);
              set({ 
                ...data, 
                initialized: true,
                error: null,
                isLoading: false,
                lastFetchTimestamp: now
              });
            } else {
              console.warn('Received empty data after re-auth, keeping existing data');
              set({
                ...existingData,
                initialized: true,
                error: null,
                isLoading: false,
                lastFetchTimestamp: now
              });
            }
          } catch (reAuthError) {
            console.error('Re-authentication failed:', reAuthError);
            set({
              ...existingData,
              error: 'Failed to refresh data',
              isLoading: false,
              initialized: true,
              lastFetchTimestamp: store.lastFetchTimestamp
            });
          }
        } else {
          console.error('Failed to fetch data:', error);
          set({
            ...existingData,
            error: 'Failed to refresh data',
            isLoading: false,
            initialized: true,
            lastFetchTimestamp: store.lastFetchTimestamp
          });
        }
      }
    } catch (error) {
      console.error('Store initialization failed:', error);
      set({ 
        ...get(),
        initialized: true,
        error: error instanceof Error ? error.message : 'Failed to initialize store',
        isLoading: false
      });
    }
  },

  // Budget History operations
  getBudgetHistory: (filters) => {
    const { budgetHistory } = get();
    let filteredHistory = [...budgetHistory];

    if (filters) {
      if (filters.startDate || filters.endDate) {
        filteredHistory = filteredHistory.filter(history => {
          const historyDate = parseISO(history.timestamp);
          return isWithinInterval(historyDate, {
            start: filters.startDate ? parseISO(filters.startDate) : new Date(0),
            end: filters.endDate ? parseISO(filters.endDate) : new Date()
          });
        });
      }

      if (filters.actionTypes && filters.actionTypes.length > 0) {
        filteredHistory = filteredHistory.filter(history =>
          filters.actionTypes?.includes(history.actionType)
        );
      }

      if (filters.categories && filters.categories.length > 0) {
        filteredHistory = filteredHistory.filter(history =>
          filters.categories?.includes(history.category)
        );
      }
    }

    return filteredHistory.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  generateBudgetReport: (startDate, endDate) => {
    const { budgetHistory, categories } = get();
    
    const historyInRange = budgetHistory.filter(history => {
      const historyDate = parseISO(history.timestamp);
      return isWithinInterval(historyDate, {
        start: parseISO(startDate),
        end: parseISO(endDate)
      });
    });

    // Count changes
    const changes = historyInRange.reduce((acc, history) => {
      acc[history.actionType]++;
      return acc;
    }, {
      created: 0,
      increased: 0,
      decreased: 0,
      deleted: 0
    });

    // Calculate category trends
    const categoryChanges = new Map<string, { oldTotal: number; newTotal: number }>();
    
    historyInRange.forEach(history => {
      const current = categoryChanges.get(history.category) || { oldTotal: 0, newTotal: 0 };
      
      if (history.actionType === 'created') {
        current.newTotal += history.newValue || 0;
      } else if (history.actionType === 'deleted') {
        current.oldTotal += history.oldValue || 0;
      } else {
        current.oldTotal += history.oldValue || 0;
        current.newTotal += history.newValue || 0;
      }
      
      categoryChanges.set(history.category, current);
    });

    const categoryTrends = Array.from(categoryChanges.entries()).map(([categoryId, values]) => {
      const category = categories.find(c => c.id === categoryId);
      const percentageChange = values.oldTotal === 0 
        ? 100 
        : ((values.newTotal - values.oldTotal) / values.oldTotal) * 100;

      return {
        categoryId,
        name: category?.name || 'Unknown Category',
        percentageChange
      };
    });

    return {
      startDate,
      endDate,
      changes,
      categoryTrends
    };
  },

  // Budget operations with history tracking
  addBudget: async (budget) => {
    const newBudget = { ...budget, id: uuidv4() };
    await addBudget(newBudget);

    // Create history entry
    const history: BudgetHistory = {
      id: uuidv4(),
      budgetId: newBudget.id,
      actionType: 'created',
      category: newBudget.category,
      newValue: newBudget.amount,
      timestamp: new Date().toISOString(),
      userId: (await supabaseClient.auth.getUser()).data.user?.id || '',
      userName: (await supabaseClient.auth.getUser()).data.user?.email || 'Unknown User'
    };
    await addBudgetHistory(history);

    set(state => ({ 
      budgets: [...state.budgets, newBudget],
      budgetHistory: [...state.budgetHistory, history],
      error: null 
    }));
  },

  updateBudget: async (id, budget) => {
    const currentBudget = get().budgets.find(b => b.id === id);
    if (!currentBudget) return;

    await updateBudget(id, budget);

    // Create history entry if amount changed
    if (budget.amount !== undefined && budget.amount !== currentBudget.amount) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      const history: BudgetHistory = {
        id: uuidv4(),
        budgetId: id,
        actionType: budget.amount > currentBudget.amount ? 'increased' : 'decreased',
        category: currentBudget.category,
        oldValue: currentBudget.amount,
        newValue: budget.amount,
        timestamp: new Date().toISOString(),
        userId: user?.id || '',
        userName: user?.email || 'Unknown User'
      };
      await addBudgetHistory(history);

      set(state => ({
        budgets: state.budgets.map(b => b.id === id ? { ...b, ...budget } : b),
        budgetHistory: [...state.budgetHistory, history],
        error: null
      }));
    } else {
      set(state => ({
        budgets: state.budgets.map(b => b.id === id ? { ...b, ...budget } : b),
        error: null
      }));
    }
  },

  deleteBudget: async (id) => {
    const currentBudget = get().budgets.find(b => b.id === id);
    if (!currentBudget) return;

    await deleteBudget(id);

    // Create history entry
    const history: BudgetHistory = {
      id: uuidv4(),
      budgetId: id,
      actionType: 'deleted',
      category: currentBudget.category,
      oldValue: currentBudget.amount,
      timestamp: new Date().toISOString(),
      userId: (await supabaseClient.auth.getUser()).data.user?.id || '',
      userName: (await supabaseClient.auth.getUser()).data.user?.email || 'Unknown User'
    };
    await addBudgetHistory(history);

    set(state => ({
      budgets: state.budgets.filter(b => b.id !== id),
      budgetHistory: [...state.budgetHistory, history],
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

  // Expense operations
  addExpense: async (expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addExpense(newExpense);
    set(state => ({ expenses: [...state.expenses, newExpense], error: null }));
  },

  updateExpense: async (id, expense) => {
    await updateExpense(id, expense);
    set(state => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...expense } : e),
      error: null
    }));
  },

  deleteExpense: async (id) => {
    await deleteExpense(id);
    set(state => ({
      expenses: state.expenses.filter(e => e.id !== id),
      error: null
    }));
  },

  // Category operations
  addCategory: async (category) => {
    const newCategory = { ...category, id: uuidv4() };
    console.log('Adding new category:', newCategory);
    await addCategory(newCategory);
    set(state => ({ categories: [...state.categories, newCategory], error: null }));
  },

  updateCategory: async (id, category) => {
    console.log('Updating category:', id, category);
    await updateCategory(id, category);
    set(state => ({
      categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c),
      error: null
    }));
  },

  deleteCategory: async (id) => {
    console.log('Deleting category:', id);
    await deleteCategory(id);
    set(state => ({
      categories: state.categories.filter(c => c.id !== id),
      error: null
    }));
  },

  // Category Group operations
  addCategoryGroup: async (group) => {
    const newGroup = { ...group, id: uuidv4() };
    console.log('Adding new category group:', newGroup);
    await addCategoryGroup(newGroup);
    set(state => ({ categoryGroups: [...state.categoryGroups, newGroup], error: null }));
  },

  updateCategoryGroup: async (id, group) => {
    console.log('Updating category group:', id, group);
    await updateCategoryGroup(id, group);
    set(state => ({
      categoryGroups: state.categoryGroups.map(g => g.id === id ? { ...g, ...group } : g),
      error: null
    }));
  },

  deleteCategoryGroup: async (id) => {
    console.log('Deleting category group:', id);
    await deleteCategoryGroup(id);
    set(state => ({
      categoryGroups: state.categoryGroups.filter(g => g.id !== id),
      error: null
    }));
  },

  // Tag operations
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
    await addTag(newTag);
    set(state => ({ tags: [...state.tags, newTag], error: null }));
  },

  updateTag: async (id, tag) => {
    await updateTag(id, tag);
    set(state => ({
      tags: state.tags.map(t => t.id === id ? { ...t, ...tag } : t),
      error: null
    }));
  },

  deleteTag: async (id) => {
    await deleteTag(id);
    set(state => ({
      tags: state.tags.filter(t => t.id !== id),
      error: null
    }));
  },

  // Recurring Expense operations
  addRecurringExpense: async (expense) => {
    const newExpense = { ...expense, id: uuidv4() };
    await addRecurringExpense(newExpense);
    set(state => ({ recurringExpenses: [...state.recurringExpenses, newExpense], error: null }));
  },

  updateRecurringExpense: async (id, expense) => {
    await updateRecurringExpense(id, expense);
    set(state => ({
      recurringExpenses: state.recurringExpenses.map(e => e.id === id ? { ...e, ...expense } : e),
      error: null
    }));
  },

  deleteRecurringExpense: async (id) => {
    await deleteRecurringExpense(id);
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

  // Settlement operations
  settleMonth: async (month, settledBy, balance) => {
    const { expenses, categoryGroups } = get();
    
    const monthlyExpenses = expenses.filter(
      expense => format(new Date(expense.date), 'yyyy-MM') === month
    );

    const groupAmounts = monthlyExpenses.reduce((acc, expense) => {
      const category = get().categories.find(c => c.id === expense.category);
      if (category) {
        const groupId = category.groupId;
        acc[groupId] = (acc[groupId] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const settlement: Settlement = {
      id: uuidv4(),
      date: new Date().toISOString(),
      paidBy: 'System',
      paidTo: 'System',
      amount: Math.abs(balance),
      status: 'completed',
      month,
      settledBy,
      settledAt: new Date().toISOString(),
      balance,
      categoryGroups: Object.entries(groupAmounts).map(([groupId, amount]) => ({
        groupId,
        amount
      })),
      expenses: monthlyExpenses.map(e => e.id)
    };

    await addSettlement(settlement);
    set(state => ({
      settlements: [...state.settlements.filter(s => s.month !== month), settlement],
      error: null
    }));
  },

  isMonthSettled: (month) => {
    const { settlements } = get();
    return settlements.some(s => s.month === month);
  },

  getSettlementDate: (month: string): string | null => {
    const { settlements } = get();
    const settlement = settlements.find(s => s.month === month);
    return settlement?.settledAt || null;
  },

  getSettlementDetails: (month: string) => {
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

export const useExpenseStore = getExpenseStore(createExpenseStore);
