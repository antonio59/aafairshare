import { useState } from 'react';
import { useExpenseStore } from '../store/expenseStore';
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
      // Create the new tag
      await addTag({
        name: inputValue,
        categoryId: formData.category,
      });

      // After tag is created, find it in the updated tags list
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

  // Prevent mouse wheel from changing number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid By
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Andres">Andres</option>
                <option value="Antonio">Antonio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Split
              </label>
              <select
                value={formData.split}
                onChange={(e) => setFormData({ ...formData, split: e.target.value as 'equal' | 'no-split' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="equal">Equal Split</option>
                <option value="no-split">No Split</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
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
    </div>
  );
};

export default ExpenseEditModal;
