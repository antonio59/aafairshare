import React, { useState } from 'react';
import { useExpenseStore } from '../../store/expenseStore';

import { Plus, Trash2, X } from 'lucide-react';

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
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold">Recurring Expenses</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Recurring Expense</span>
        </button>
      </div>
      
      {recurringExpenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recurring expenses set up yet.
        </div>
      ) : (
        <div className="space-y-4">
          {recurringExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-lg">{expense.description}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Amount:</span> £{expense.amount.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium">Frequency:</span> {expense.frequency}
                    </p>
                    <p>
                      <span className="font-medium">Day:</span> {expense.dayOfMonth}
                    </p>
                    <p>
                      <span className="font-medium">Split:</span> {expense.split}
                    </p>
                    <p>
                      <span className="font-medium">Paid By:</span> {expense.paidBy}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg p-2 h-10 w-full sm:w-10 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="sm:hidden">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h4 className="text-lg font-semibold">Add Recurring Expense</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                <select
                  required
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] bg-white"
                >
                  <option value="">Select who paid</option>
                  <option value="partner1">Partner 1</option>
                  <option value="partner2">Partner 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Split</label>
                <select
                  required
                  value={formData.split}
                  onChange={(e) => setFormData({ ...formData, split: e.target.value as 'equal' | 'no-split' })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] bg-white"
                >
                  <option value="equal">Equal Split</option>
                  <option value="no-split">No Split</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="31"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[48px]"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {onClose && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px]"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;
