import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { UserStore, ExpenseStore } from './types';

// Create store instances with proper typing
export const createUserStore = (
  storeCreator: StateCreator<UserStore>
) => create<UserStore>()(
  persist(
    storeCreator,
    {
      name: 'user-storage',
      partialize: (state) => ({
        users: state.users,
        currentUser: null, // Don't persist current user to avoid stale auth state
        isInitialized: state.isInitialized
      }),
    }
  )
);

export const createExpenseStore = (
  storeCreator: StateCreator<ExpenseStore>
) => create<ExpenseStore>()(storeCreator);

// Store instances will be created lazily when imported
let userStore: ReturnType<typeof createUserStore> | null = null;
let expenseStore: ReturnType<typeof createExpenseStore> | null = null;

// Getter functions to ensure lazy initialization
export const getUserStore = (creator: StateCreator<UserStore>) => {
  if (!userStore) {
    userStore = createUserStore(creator);
  }
  return userStore;
};

export const getExpenseStore = (creator: StateCreator<ExpenseStore>) => {
  if (!expenseStore) {
    expenseStore = createExpenseStore(creator);
  }
  return expenseStore;
};
