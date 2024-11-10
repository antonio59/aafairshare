import { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { X } from 'lucide-react';
import type { Expense } from '../types';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

interface ExpenseEditModalProps {
  expense: Expense;
  onClose: () => void;
}

const ExpenseEditModal = ({ expense, onClose }: ExpenseEditModalProps) => {
  const { updateExpense, categories, tags, addTag } = useExpenseStore();
  const [formData, setFormData] = useState({
    description: expense.description || '',
    amount: expense.amount.toString(),
    date: new Date(expense.date).toISOString().split('T')[0],
    category: expense.category,
    paidBy: expense.paidBy,
    split: expense.split,
    tags: expense.tags || [],
  });

  // Group categories for the select input
  const groupedCategories = categories
    .filter(cat => cat !== null)
    .map(cat => ({
      value: cat.id,
      label: cat.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Convert tags for the select input
  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateExpense(expense.id, {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    });
    onClose();
  };

  const handleTagChange = (newValue: any) => {
    setFormData(prev => ({
      ...prev,
      tags: newValue ? newValue.map((v: any) => v.value) : [],
    }));
  };

  const handleCreateTag = async (inputValue: string) => {
    try {
      await addTag({
        name: inputValue,
        categoryId: formData.category,
      });

      const newTag = tags.find(tag => tag.name === inputValue);
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

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '48px',
      borderRadius: '0.75rem',
      borderColor: '#E5E7EB',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#D1D5DB',
      },
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '4px 16px',
    }),
    input: (base: any) => ({
      ...base,
      padding: '4px',
    }),
    option: (base: any, state: any) => ({
      ...base,
      padding: '10px 16px',
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#EFF6FF' : 'white',
      '&:active': {
        backgroundColor: '#DBEAFE',
      },
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden',
    }),
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full sm:rounded-xl sm:max-w-md max-h-[100dvh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between sm:rounded-t-xl">
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Category
                </label>
                <Select
                  value={groupedCategories.find(opt => opt.value === formData.category)}
                  onChange={(option) => setFormData({ ...formData, category: option?.value || '' })}
                  options={groupedCategories}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Select a category"
                  required
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Tags
                </label>
                <CreatableSelect
                  isMulti
                  value={formData.tags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? { value: tag.id, label: tag.name } : null;
                  })}
                  onChange={handleTagChange}
                  onCreateOption={handleCreateTag}
                  options={tagOptions}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Add tags..."
                  styles={selectStyles}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Amount (£)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  onWheel={handleWheel}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base appearance-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Paid By
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
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
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
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
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t sm:rounded-b-xl">
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
  );
};

export default ExpenseEditModal;
