import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import type { RecurringExpense } from '../../types';
import Dropdown from '../common/Dropdown';
import TagInput from '../common/TagInput';

const CATEGORY_GROUPS = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Others'
] as const;

interface FormData {
  description: string;
  category: string;
  amount: string;
  dayOfMonth: string;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  paidBy: string;
  split: 'equal' | 'no-split';
  tags: string[];
  startDate: string;
}

const RecurringExpenses = () => {
  const { categories, tags, recurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense, addTag } = useExpenseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    description: '',
    category: '',
    amount: '',
    dayOfMonth: '1',
    frequency: 'monthly',
    paidBy: 'Andres',
    split: 'equal',
    tags: [],
    startDate: new Date().toISOString().split('T')[0],
  });

  // Convert categories for the dropdown
  const categoryOptions = useMemo(() => 
    categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
      group: cat.group
    })).sort((a, b) => a.label.localeCompare(b.label)),
    [categories]
  );

  const handleAddExpense = () => {
    setFormData({
      description: '',
      category: '',
      amount: '',
      dayOfMonth: '1',
      frequency: 'monthly',
      paidBy: 'Andres',
      split: 'equal',
      tags: [],
      startDate: new Date().toISOString().split('T')[0],
    });
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: RecurringExpense) => {
    setFormData({
      description: expense.description || '',
      category: expense.category,
      amount: expense.amount.toString(),
      dayOfMonth: expense.dayOfMonth.toString(),
      frequency: expense.frequency,
      paidBy: expense.paidBy,
      split: expense.split,
      tags: expense.tags || [],
      startDate: expense.startDate,
    });
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      try {
        await deleteRecurringExpense(id);
      } catch (error) {
        console.error('Failed to delete recurring expense:', error);
      }
    }
  };

  const handleCreateTag = async (name: string) => {
    const newTag = {
      name,
      categoryId: formData.category,
    };
    await addTag(newTag);
  };

  // Prevent mouse wheel from changing number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return;
    
    setIsSubmitting(true);
    try {
      const expense = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        paidBy: formData.paidBy,
        split: formData.split,
        dayOfMonth: parseInt(formData.dayOfMonth),
        frequency: formData.frequency,
        tags: formData.tags,
        startDate: formData.startDate,
      };

      if (editingExpense) {
        await updateRecurringExpense(editingExpense.id, expense);
      } else {
        await addRecurringExpense(expense);
      }

      setIsModalOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save recurring expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recurring Expenses</h3>
        <button
          onClick={handleAddExpense}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Add Recurring Expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-2">
          {recurringExpenses.map(expense => {
            const category = categories.find(c => c.id === expense.category);
            const expenseTags = expense.tags?.map(tagId => 
              tags.find(t => t.id === tagId)?.name
            ).filter(Boolean);

            return (
              <div
                key={expense.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{expense.description || 'Untitled Expense'}</span>
                    <span className="text-sm text-blue-600">
                      {category?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                    <span>£{expense.amount.toFixed(2)}</span>
                    <span>•</span>
                    <span className="capitalize">{expense.frequency}</span>
                    <span>•</span>
                    <span>Day {expense.dayOfMonth}</span>
                    <span>•</span>
                    <span>Paid by {expense.paidBy}</span>
                    <span>•</span>
                    <span>{expense.split === 'equal' ? 'Equal Split' : 'No Split'}</span>
                  </div>
                  {expenseTags && expenseTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expenseTags.map((tag, index) => (
                        <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                    aria-label="Edit expense"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Delete expense"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          {recurringExpenses.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No recurring expenses set up yet. Add expenses that should automatically repeat.
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingExpense ? 'Edit' : 'Add'} Recurring Expense
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Main Details Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
                <Dropdown
                  label="Category"
                  value={formData.category}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  options={categoryOptions}
                  placeholder="Select a category"
                  required
                  groupBy
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a description..."
                  />
                </div>

                <TagInput
                  label="Tags"
                  value={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  onCreateTag={handleCreateTag}
                  availableTags={tags}
                  placeholder="Add tags..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (£)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        onWheel={handleWheel}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Split Details Card */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Month
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={formData.dayOfMonth}
                        onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                        onWheel={handleWheel}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <Dropdown
                    label="Frequency"
                    value={formData.frequency}
                    onChange={(value) => setFormData(prev => ({ ...prev, frequency: value as 'monthly' | 'quarterly' | 'yearly' }))}
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'quarterly', label: 'Quarterly' },
                      { value: 'yearly', label: 'Yearly' }
                    ]}
                    required
                  />

                  <Dropdown
                    label="Paid By"
                    value={formData.paidBy}
                    onChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}
                    options={[
                      { value: 'Andres', label: 'Andres' },
                      { value: 'Antonio', label: 'Antonio' }
                    ]}
                    required
                  />
                </div>

                <Dropdown
                  label="Split"
                  value={formData.split}
                  onChange={(value) => setFormData(prev => ({ ...prev, split: value as 'equal' | 'no-split' }))}
                  options={[
                    { value: 'equal', label: 'Equal Split' },
                    { value: 'no-split', label: 'No Split' }
                  ]}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white p-4 shadow-lg rounded-t-lg flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.category}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;
