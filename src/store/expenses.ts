/**
 * Expenses store using Zustand for state management
 * Manages expenses data, loading states, and CRUD operations
 * 
 * @module store/expenses
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Expense, NewExpense } from '@/types/expenses';

/**
 * Interface defining the expenses store state and actions
 */
interface ExpenseState {
  /** List of all expenses */
  expenses: Expense[];
  /** Indicates if expenses are being loaded */
  isLoading: boolean;
  /** Any error that occurred during data fetching */
  error: string | null;
  /** Selected expense for editing */
  selectedExpense: Expense | null;
  
  /**
   * Fetches expenses for a given date range
   * @param startDate - The start date for fetching expenses
   * @param endDate - The end date for fetching expenses
   */
  fetchExpenses: (startDate: string, endDate: string) => Promise<void>;
  
  /**
   * Adds a new expense
   * @param expense - The expense data to add
   * @returns The newly created expense
   */
  addExpense: (expense: NewExpense) => Promise<Expense>;
  
  /**
   * Updates an existing expense
   * @param expense - The expense data with updated fields
   * @returns The updated expense
   */
  updateExpense: (expense: Expense) => Promise<Expense>;
  
  /**
   * Deletes an expense by ID
   * @param id - The ID of the expense to delete
   * @returns Success status
   */
  deleteExpense: (id: string) => Promise<boolean>;
  
  /**
   * Sets the selected expense for editing
   * @param expense - The expense to select, or null to clear selection
   */
  setSelectedExpense: (expense: Expense | null) => void;
}

/**
 * Expense store with Zustand
 * Uses devtools middleware for Redux DevTools integration
 */
export const useExpenseStore = create<ExpenseState>()(
  devtools(
    (set) => ({
      expenses: [],
      isLoading: false,
      error: null,
      selectedExpense: null,
      
      fetchExpenses: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/expenses?startDate=${startDate}&endDate=${endDate}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch expenses');
          }
          
          const data = await response.json();
          set({ expenses: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      addExpense: async (expense) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add expense');
          }
          
          const newExpense = await response.json();
          set(state => ({ 
            expenses: [newExpense, ...state.expenses], 
            isLoading: false 
          }));
          
          return newExpense;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateExpense: async (expense) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/expenses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update expense');
          }
          
          const updatedExpense = await response.json();
          set(state => ({
            expenses: state.expenses.map(item => 
              item.id === updatedExpense.id ? updatedExpense : item
            ),
            isLoading: false,
            selectedExpense: null,
          }));
          
          return updatedExpense;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/expenses?id=${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete expense');
          }
          
          set(state => ({
            expenses: state.expenses.filter(expense => expense.id !== id),
            isLoading: false,
          }));
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An unknown error occurred', 
            isLoading: false 
          });
          return false;
        }
      },
      
      setSelectedExpense: (expense) => {
        set({ selectedExpense: expense });
      },
    }),
    { name: 'expense-store' }
  )
);