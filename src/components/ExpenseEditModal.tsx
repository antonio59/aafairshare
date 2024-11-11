import { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { X, Calendar } from 'lucide-react';
import type { Expense, Category } from '../types';
import Dropdown from './common/Dropdown';
import TagInput from './common/TagInput';

interface ExpenseEditModalProps {
  expense: Expense;
  onClose: () => void;
}

const ExpenseEditModal = ({ expense, onClose }: ExpenseEditModalProps) => {
  const { updateExpense, categories, categoryGroups, tags, addTag } = useExpenseStore();
  const { currentUser } = useUserStore();
  const currencySymbol = currentUser?.preferences.currency === 'GBP' ? '£' : '$';

  const [formData, setFormData] = useState({
    description: expense.description || '',
    amount: expense.amount ? expense.amount.toString() : '',
    date: new Date(expense.date).toISOString().split('T')[0],
    category: expense.category,
    paidBy: expense.paidBy,
    split: expense.split,
    tags: expense.tags || [],
  });

  // Convert categories for the dropdown with proper grouping
  const categoryOptions = categories
    .filter((cat): cat is Category => cat !== null)
    .map(cat => {
      const group = categoryGroups.find(g => g.id === cat.groupId);
      return {
        value: cat.id,
        label: cat.name,
        icon: cat.icon,
        group: group?.name || 'Other'
      };
    })
    .sort((a, b) => {
      // First sort by group name
      const groupA = a.group || '';
      const groupB = b.group || '';
      const groupCompare = groupA.localeCompare(groupB);
      
      // If groups are the same, sort by label
      if (groupCompare === 0) {
        return a.label.localeCompare(b.label);
      }
      return groupCompare;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    updateExpense(expense.id, {
      ...formData,
      amount,
      date: new Date(formData.date).toISOString(),
    });
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleCreateTag = async (name: string) => {
    try {
      await addTag({
        name,
        categoryId: formData.category,
      });

      // After tag is created, find it in the updated tags list
      const newTag = tags.find(tag => tag.name === name);
      if (newTag) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.id],
        }));
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const inputClassName = "w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white";

  return (
    <>
      <style>
        {`
          .mobile-date-input::-webkit-calendar-picker-indicator {
            background: transparent;
            bottom: 0;
            color: transparent;
            cursor: pointer;
            height: auto;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: auto;
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white w-full sm:rounded-xl sm:max-w-md max-h-[100dvh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between sm:rounded-t-xl z-10">
            <h2 className="text-xl font-semibold text-gray-900">Edit Expense</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <form id="expense-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-7">
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
                  <label className="block text-sm font-medium text-gray-900 mb-2.5">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputClassName}
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

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2.5">
                    Amount ({currencySymbol})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {currencySymbol}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={formData.amount}
                      onChange={handleAmountChange}
                      onWheel={handleWheel}
                      className={`${inputClassName} pl-8`}
                      placeholder="0.00"
                      required
                      pattern="^\d*\.?\d{0,2}$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2.5">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className={`${inputClassName} pr-12 mobile-date-input`}
                      style={{
                        colorScheme: 'light',
                      }}
                      required
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2.5">
                    Paid By
                  </label>
                  <select
                    value={formData.paidBy}
                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    className={inputClassName}
                    required
                  >
                    <option value="Andres">Andres</option>
                    <option value="Antonio">Antonio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2.5">
                    Split
                  </label>
                  <select
                    value={formData.split}
                    onChange={(e) => setFormData({ ...formData, split: e.target.value as 'equal' | 'no-split' })}
                    className={inputClassName}
                    required
                  >
                    <option value="equal">Equal Split</option>
                    <option value="no-split">No Split</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t sm:rounded-b-xl z-10">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="min-w-[88px] px-4 py-2.5 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                form="expense-form"
                type="submit"
                className="min-w-[88px] bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpenseEditModal;
