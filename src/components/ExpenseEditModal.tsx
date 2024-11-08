import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import type { Expense } from '../types';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const CATEGORY_GROUPS = [
  'Utilities',
  'Housing',
  'Food',
  'Transportation',
  'Insurance',
  'Entertainment',
  'Clothing',
  'Health and wellness',
  'Miscellaneous',
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
    amount: expense.amount.toString(),
    date: new Date(expense.date).toISOString().split('T')[0],
    category: expense.category,
    paidBy: expense.paidBy,
    split: expense.split,
    tags: expense.tags || [],
  });

  // Group categories for the select input
  const groupedCategories = useMemo(() => {
    const groups = CATEGORY_GROUPS.map(group => ({
      label: group,
      options: categories
        .filter(cat => cat.group === group)
        .map(cat => ({
          value: cat.id,
          label: cat.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    })).filter(group => group.options.length > 0);

    return groups;
  }, [categories]);

  // Convert tags for the select input
  const tagOptions = useMemo(() => 
    tags.map(tag => ({
      value: tag.id,
      label: tag.name,
    })),
    [tags]
  );

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

  const handleCreateTag = (inputValue: string) => {
    const newTag = {
      name: inputValue,
      categoryId: formData.category,
    };
    
    addTag(newTag);
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.id!],
    }));
  };

  // Prevent mouse wheel from changing number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Expense</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category - Full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                value={
                  formData.category
                    ? {
                        value: formData.category,
                        label: categories.find(c => c.id === formData.category)?.name
                      }
                    : null
                }
                onChange={(option) => setFormData({ ...formData, category: option?.value || '' })}
                options={groupedCategories}
                className="w-full"
                classNamePrefix="react-select"
                placeholder="Select a category"
                required
              />
            </div>

            {/* Description - Full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Tags - Full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                onWheel={handleWheel}
                className="w-full amount-input"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full"
                required
              />
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid By
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full"
                required
              >
                <option value="Andres">Andres</option>
                <option value="Antonio">Antonio</option>
              </select>
            </div>

            {/* Split */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Split
              </label>
              <select
                value={formData.split}
                onChange={(e) => setFormData({ ...formData, split: e.target.value })}
                className="w-full"
                required
              >
                <option value="equal">Equal Split</option>
                <option value="no-split">No Split</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseEditModal;