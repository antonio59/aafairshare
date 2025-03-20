import { useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Expense, ExpenseFilters } from '@/types/expenses';
import { exportToCSV, exportToPDF } from '@/utils/exportService';

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: (filters: ExpenseFilters) => Promise<void>;
  exportExpenses: (format: 'csv' | 'pdf') => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {}
  );

  const fetchExpenses = useCallback(async ({ startDate, endDate }: ExpenseFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          users:paid_by(name)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (expensesError) throw new Error(expensesError.message);
      setExpenses(expensesData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const exportExpenses = useCallback(async (format: 'csv' | 'pdf') => {
    if (!expenses.length) return;
    
    const month = expenses[0].date.slice(0, 7); // Get YYYY-MM from first expense
    
    try {
      if (format === 'csv') {
        await exportToCSV(expenses, month);
      } else {
        await exportToPDF(expenses, month);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export expenses');
    }
  }, [expenses]);

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    exportExpenses
  };
}
