'use client';

import { useState, useEffect } from 'react';
import ExpenseDetails from './ExpenseDetails';
import { cn } from '@/lib/utils';
import { exportToCSV, exportToPDF } from '@/utils/exportService';
import { createStandardBrowserClient } from '@/utils/supabase-client';

import type { Expense } from '@/types/expenses';

export interface ExpensesDashboardProps {
  initialMonth?: string;
}

export default function ExpensesDashboard({ initialMonth }: ExpensesDashboardProps = {}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth || new Date().toISOString().slice(0, 7)
  );
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createStandardBrowserClient();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const startDate = `${selectedMonth}-01`;
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + 1);
        date.setDate(0); // Get last day of selected month
        const endDate = date.toISOString().split('T')[0];
        
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select(`
            *,
            users:paid_by(name)
          `)
          .gte('date', startDate)
          .lt('date', endDate)
          .order('date', { ascending: false });

        if (expensesError) {
          throw new Error(`Failed to fetch expenses: ${expensesError.message}`);
        }

        setExpenses(expensesData || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error fetching expenses:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [selectedMonth, supabase]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className={cn("space-y-6")}>
      <div className={cn("flex justify-between items-center")}>
        <h2 className={cn("text-xl font-semibold")}>Monthly Overview</h2>
        <div className={cn("flex items-center gap-4")}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={cn(
              "border rounded p-2",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
          <button
            onClick={() => exportToCSV(expenses, selectedMonth)}
            className={cn(
              "px-4 py-2 rounded transition-colors",
              "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            CSV
          </button>
          <button
            onClick={() => exportToPDF(expenses, selectedMonth)}
            className={cn(
              "px-4 py-2 rounded transition-colors",
              "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            PDF
          </button>
        </div>
      </div>

      <div className={cn("bg-white p-4 rounded-lg shadow relative")}>
        {isLoading && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-white/50"
          )}>
            <div className={cn(
              "animate-spin rounded-full h-8 w-8",
              "border-b-2 border-indigo-600"
            )}></div>
          </div>
        )}
        {error && (
          <div className={cn(
            "bg-red-50 border-l-4 border-red-400 p-4 mb-4"
          )}>
            <div className={cn("flex")}>
              <div className={cn("flex-shrink-0")}>
                <svg className={cn("h-5 w-5 text-red-400")} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={cn("ml-3")}>
                <p className={cn("text-sm text-red-700")}>{error}</p>
              </div>
            </div>
          </div>
        )}
        <h3 className={cn("text-lg font-medium mb-2")}>Expenses Summary</h3>
        <p className={cn("text-2xl font-bold")}>£{totalExpenses.toFixed(2)}</p>
        <div className={cn("mt-4 space-y-4")}>
          {expenses.map((expense) => (
            <ExpenseDetails
              key={expense.id}
              expense={expense}
              onUpdate={() => {
                const fetchExpenses = async () => {
                  const { data: expensesData, error: expensesError } = await supabase
                    .from('expenses')
                    .select(`
                      *,
                      users:paid_by(name)
                    `)
                    .gte('date', `${selectedMonth}-01`)
                    .lt('date', `${selectedMonth}-31`)
                    .order('date', { ascending: false });

                  if (expensesError) {
                    const errorMessage = `Failed to fetch expenses: ${expensesError.message}`;
                    console.error(errorMessage);
                    setError(errorMessage);
                    return;
                  }
                  setError(null);

                  setExpenses(expensesData || []);
                };
                fetchExpenses();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}