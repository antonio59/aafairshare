import React, { useState, useMemo } from 'react';
import { X, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import type { Expense } from '../types';
import Dropdown from './common/Dropdown';
import TagInput from './common/TagInput';

const CATEGORY_GROUPS = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Others'
] as const;

interface ExpenseEditModalProps {
  expense: Expense;
  onClose: () => void;
}

const ExpenseEditModal = ({ expense, onClose }: ExpenseEditModalProps) => {
  const { updateExpense, categories, tags, addTag } = useExpenseStore();
  const { currentUser } = useUserStore();
  const [formData, setFormData] = useState({
    description: expense.description || '',
    amount: expense.amount,
    date: new Date(expense.date).toISOString().split('T')[0],
    category: expense.category,
    paidBy: expense.paidBy,
    split: expense.split,
    tags: expense.tags || [],
    isRecurring: false,
    recurringDay: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return;
    
    setIsSubmitting(true);
    try {
      await updateExpense(expense.id, {
        ...formData,
        amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount,
        date: new Date(formData.date).toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to update expense:', error);
      setIsSubmitting(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Expense</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
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
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    onWheel={handleWheel}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Split Details Card */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Recurring Details Card */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Recurring Expense
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Enable this for expenses that occur monthly
                </p>
              </div>
              <div className="flex items-center h-6">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
            </div>

            {formData.isRecurring && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Month
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="31"
                  value={formData.recurringDay}
                  onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                  onWheel={handleWheel}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter day (1-31)"
                  required={formData.isRecurring}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white p-4 shadow-lg rounded-t-lg flex gap-4">
            <button
              type="button"
              onClick={onClose}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseEditModal;
