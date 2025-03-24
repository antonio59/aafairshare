'use client';

/**
 * ExpenseListWithZustand component
 * Demonstrates using Zustand for state management with expenses
 * 
 * @module components/expenses/ExpenseListWithZustand
 */
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { useExpenseStore } from '@/store';

/**
 * ExpenseListWithZustand props
 */
interface ExpenseListWithZustandProps {
  /** CSS class name for custom styling */
  className?: string;
}

/**
 * Expense list component using Zustand for state management
 * Lists expenses and provides actions for managing them
 * 
 * @component
 */
export default function ExpenseListWithZustand({ className }: ExpenseListWithZustandProps) {
  // Get the current month's date range
  const [dateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
      startDate: format(firstDay, 'yyyy-MM-dd'),
      endDate: format(lastDay, 'yyyy-MM-dd')
    };
  });
  
  // Get expenses data and actions from Zustand store
  const { 
    expenses, 
    isLoading, 
    error, 
    fetchExpenses, 
    deleteExpense,
    setSelectedExpense 
  } = useExpenseStore();
  
  // Fetch expenses when component mounts or date range changes
  useEffect(() => {
    fetchExpenses(dateRange.startDate, dateRange.endDate);
  }, [fetchExpenses, dateRange]);
  
  // Handle selecting an expense for editing
  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    // Here you would typically open an edit modal or navigate to edit page
  };
  
  // Handle deleting an expense
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };
  
  // Display loading state
  if (isLoading && expenses.length === 0) {
    return <div className={className}>Loading expenses...</div>;
  }
  
  // Display error state
  if (error) {
    return <div className={className}>Error: {error}</div>;
  }
  
  // Display empty state
  if (expenses.length === 0) {
    return <div className={className}>No expenses found for the selected period.</div>;
  }
  
  // Render expenses list
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Expenses</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-right">Amount</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="px-4 py-2">{expense.date}</td>
                <td className="px-4 py-2">{expense.notes}</td>
                <td className="px-4 py-2 text-right">${expense.amount.toFixed(2)}</td>
                <td className="px-4 py-2">
                  {/* Use a safe way to access category, since it's not in the Expense type */}
                  {(expense as any).category?.name || 'Uncategorized'}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button 
                    onClick={() => handleEdit(expense)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}