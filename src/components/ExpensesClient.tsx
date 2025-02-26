'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/utils';
import { format } from 'date-fns';
import { Dialog } from './ui/dialog';
import { MultiSelect } from './ui/multi-select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { DatePicker } from './ui/date-picker';
import type { Expense, Category, CategoryGroup, Tag } from '@/types';

interface RecurringExpense {
  id: string;
  description?: string;
  amount: number;
  category: string;
  paidBy: string;
  split: 'equal' | 'no-split';
  startDate: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth: number;
  tags: string[];
  lastProcessed?: string;
}

interface ExpensesData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  stats: {
    totalAmount: number;
    averageAmount: number;
    expenseCount: number;
    byCategory: Record<string, number>;
    byPaidBy: Record<string, number>;
    byMonth: Record<string, number>;
  };
  recurringExpenses: RecurringExpense[];
}

interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  tags?: string[];
  paidBy?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export function ExpensesClient() {
  // URL Search Params for filters
  const searchParams = useSearchParams();
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const categoryParams = searchParams.get('categories')?.split(',') || [];
  const tags = searchParams.get('tags')?.split(',') || [];
  const paidBy = searchParams.get('paidBy')?.split(',') || [];
  const minAmount = searchParams.get('minAmount') || '';
  const maxAmount = searchParams.get('maxAmount') || '';

  // Local state
  const [data, setData] = useState<ExpensesData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from server component
  useEffect(() => {
    const dataScript = document.getElementById('expenses-data');
    if (dataScript) {
      const expensesData = JSON.parse(dataScript.innerHTML);
      setData(expensesData);
    }
  }, []);

  if (!data) return null;

  const { expenses, categories, categoryGroups, tags: allTags, stats } = data;

  // Options for filters
  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon,
    group: categoryGroups.find(g => g.id === cat.groupId)?.name || 'Other'
  }));

  const tagOptions = allTags.map(tag => ({
    value: tag.id,
    label: tag.name,
  }));

  const paidByOptions = [
    { value: 'Andres', label: 'Andres' },
    { value: 'Antonio', label: 'Antonio' }
  ];

  // Handlers
  const handleAddExpense = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add expense');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setIsSubmitting(false);
      setShowAddModal(false);
    }
  };

  const handleEditExpense = async (formData: FormData) => {
    if (!selectedExpense) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/expenses/${selectedExpense.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update expense');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update expense:', error);
    } finally {
      setIsSubmitting(false);
      setShowEditModal(false);
      setSelectedExpense(null);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold mt-1">£{stats.totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Expense</h3>
          <p className="text-2xl font-bold mt-1">£{stats.averageAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Number of Expenses</h3>
          <p className="text-2xl font-bold mt-1">{stats.expenseCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Most Common Category</h3>
          <p className="text-2xl font-bold mt-1">
            {Object.entries(stats.byCategory)
              .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button onClick={() => setShowAddModal(true)}>
            Add Expense
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <DatePicker
                value={startDate}
                onChange={(date) => {
                  const newParams = createQueryString(
                    'startDate',
                    date ? format(date, 'yyyy-MM-dd') : '',
                    searchParams
                  );
                  window.history.pushState({}, '', `?${newParams}`);
                }}
                placeholder="Start Date"
              />
              <DatePicker
                value={endDate}
                onChange={(date) => {
                  const newParams = createQueryString(
                    'endDate',
                    date ? format(date, 'yyyy-MM-dd') : '',
                    searchParams
                  );
                  window.history.pushState({}, '', `?${newParams}`);
                }}
                placeholder="End Date"
              />
            </div>
          </div>
          <MultiSelect
            label="Categories"
            options={categoryOptions}
            selected={categoryParams}
            onChange={(values) => {
              const newParams = createQueryString(
                'categories',
                values.join(','),
                searchParams
              );
              window.history.pushState({}, '', `?${newParams}`);
            }}
            placeholder="Select categories..."
          />
          <MultiSelect
            label="Tags"
            options={tagOptions}
            selected={tags}
            onChange={(values) => {
              const newParams = createQueryString(
                'tags',
                values.join(','),
                searchParams
              );
              window.history.pushState({}, '', `?${newParams}`);
            }}
            placeholder="Select tags..."
          />
          <MultiSelect
            label="Paid By"
            options={paidByOptions}
            selected={paidBy}
            onChange={(values) => {
              const newParams = createQueryString(
                'paidBy',
                values.join(','),
                searchParams
              );
              window.history.pushState({}, '', `?${newParams}`);
            }}
            placeholder="Select payers..."
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={minAmount}
                onChange={(e) => {
                  const newParams = createQueryString(
                    'minAmount',
                    e.target.value,
                    searchParams
                  );
                  window.history.pushState({}, '', `?${newParams}`);
                }}
                placeholder="Min Amount"
              />
              <Input
                type="number"
                value={maxAmount}
                onChange={(e) => {
                  const newParams = createQueryString(
                    'maxAmount',
                    e.target.value,
                    searchParams
                  );
                  window.history.pushState({}, '', `?${newParams}`);
                }}
                placeholder="Max Amount"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm divide-y">
        {expenses.map(expense => (
          <div
            key={expense.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{expense.description}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(expense.date), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">£{expense.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Paid by {expense.paidBy}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedExpense(expense);
                  setShowEditModal(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteExpense(expense.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        {/* Add expense form */}
      </Dialog>

      {/* Edit Expense Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setSelectedExpense(null);
        }}
      >
        {/* Edit expense form */}
      </Dialog>
    </div>
  );
}
