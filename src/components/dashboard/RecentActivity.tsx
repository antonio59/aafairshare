import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import type { Expense } from '@/types/supabase';

import { formatCurrency } from '@/utils/formatters';

interface RecentActivityProps {
  expenses: Expense[] | null;
}

export function RecentActivity({ expenses }: RecentActivityProps) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h2 className="card-title">Recent Expenses</h2>
        <p className="card-description">Your latest recorded expenses</p>
      </div>
      <div className="card-content">
        {expenses && expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-details">
                  <div className="expense-name">
                    {expense.notes || `Expense ${expense.id.substring(0, 8)}`}
                  </div>
                  <div className="expense-meta">
                    {expense.date ? new Date(expense.date).toLocaleDateString('en-GB') : 'No date'}
                  </div>
                </div>
                <div className="expense-amount">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No recent expenses found</p>
            <Link href="/expenses/new" className="btn btn-primary mt-4">
              Add Your First Expense
            </Link>
          </div>
        )}
      </div>
      {expenses && expenses.length > 0 && (
        <div className="card-footer flex justify-between items-center">
          <Link href="/expenses" className="text-primary text-sm font-medium hover:underline">
            View all expenses
          </Link>
          <Link href="/expenses/new" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            <Plus className="h-3 w-3" />
            <span>Add new</span>
          </Link>
        </div>
      )}
    </div>
  );
}
