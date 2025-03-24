'use client';

import { useEffect, useState } from 'react';

import type { ExpenseFilters } from '@/types/expenses';

import ExpenseDetails from '@/components/expenses/ExpenseDetails';
import { useExpenses } from '@/hooks/useExpenses';
import { cn } from '@/lib/utils';

export interface ExpensesDashboardProps {
  initialMonth?: string;
}

export function ExpensesDashboard({ initialMonth = new Date().toISOString().slice(0, 7) }: ExpensesDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth || new Date().toISOString().slice(0, 7)
  );
  
  const { expenses, isLoading, error, fetchExpenses, exportExpenses } = useExpenses();

  useEffect(() => {
    if (selectedMonth) {
      const startDate = `${selectedMonth}-01`;
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + 1);
      date.setDate(0); // Get last day of selected month
      
      // Ensure endDate is always a string by providing a fallback
      let endDate = `${selectedMonth}-${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}`;
      try {
        const formattedDate = date.toISOString().split('T')[0];
        if (formattedDate) {
          endDate = formattedDate;
        }
      } catch (err) {
        console.error('Error formatting end date:', err);
      }
      
      const filters: ExpenseFilters = { startDate, endDate };
      fetchExpenses(filters);
    }
  }, [selectedMonth, fetchExpenses]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await exportExpenses(format);
    } catch (err) {
      console.error('Failed to export expenses:', err);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleExpenseUpdate = () => {
    const startDate = `${selectedMonth}-01`;
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    
    // Ensure endDate is always a string
    let endDate = `${selectedMonth}-${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}`;
    try {
      const formattedDate = date.toISOString().split('T')[0];
      if (formattedDate) {
        endDate = formattedDate;
      }
    } catch (err) {
      console.error('Error formatting end date:', err);
    }
    
    const filters: ExpenseFilters = { startDate, endDate };
    fetchExpenses(filters);
  };

  return (
    <div className={cn("space-y-6")}>
      <div className={cn("flex justify-between items-center")}>
        <h2 className={cn("text-xl font-semibold")}>Monthly Overview</h2>
        <div className={cn("flex items-center gap-4")}>
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className={cn(
              "border rounded p-2",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
          />
          <button
            onClick={() => handleExport('csv')}
            className={cn(
              "px-4 py-2 rounded transition-colors",
              "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
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
            )} />
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
              onUpdate={handleExpenseUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};