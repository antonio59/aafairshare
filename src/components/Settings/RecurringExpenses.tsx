import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import type { RecurringExpense } from '../../types';
import { Plus } from 'lucide-react';

interface RecurringExpensesProps {
  onClose?: () => void;
}

interface RecurringExpenseFormData {
  description: string;
  amount: string;
  category: string;
  paidBy: string;
  split: 'equal' | 'no-split';
  startDate: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  dayOfMonth: string;
  tags: string[];
}

const RecurringExpenses: React.FC<RecurringExpensesProps> = ({ onClose }) => {
  const { recurringExpenses, deleteRecurringExpense, addRecurringExpense, categories } = useExpenseStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<RecurringExpenseFormData>({
    description: '',
    amount: '',
    category: '',
    paidBy: '',
    split: 'equal',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'monthly',
    dayOfMonth: '1',
    tags: [],
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecurringExpense(id);
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRecurringExpense({
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        paidBy: formData.paidBy,
        split: formData.split,
        startDate: formData.startDate,
        frequency: formData.frequency,
        dayOfMonth: parseInt(formData.dayOfMonth),
        tags: formData.tags,
      });
      setShowAddModal(false);
      setFormData({
        description: '',
        amount: '',
        category: '',
        paidBy: '',
        split: 'equal',
        startDate: new Date().toISOString().split('T')[0],
        frequency: 'monthly',
        dayOfMonth: '1',
        tags: [],
      });
    } catch (error) {
      console.error('Failed to add recurring expense:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recurring Expenses</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Recurring Expense
        </button>
      </div>
      
      {recurringExpenses.length === 0 ? (
        <p className="text-gray-500">No recurring expenses set up yet.</p>
      ) : (
        <div className="space-y-4">
          {recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    Amount: £{expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Frequency: {expense.frequency}
                  </p>
                  <p className="text-sm text-gray-600">
                    Day of Month: {expense.dayOfMonth}
                  </p>
                  <p className="text-sm text-gray-600">
                    Split: {expense.split}
                  </p>
                  <p className="text-sm text-gray-600">
                    Paid By: {expense.paidBy}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Add Recurring Expense</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Paid By</label>
                <select
                  required
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select who paid</option>
                  <option value="partner1">Partner 1</option>
                  <option value="partner2">Partner 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Split</label>
                <select
                  required
                  value={formData.split}
                  onChange={(e) => setFormData({ ...formData, split: e.target.value as 'equal' | 'no-split' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="equal">Equal Split</option>
                  <option value="no-split">No Split</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Month</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;
