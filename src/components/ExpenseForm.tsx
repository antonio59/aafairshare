import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { X } from 'lucide-react';

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

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { addExpense, categories, tags, addTag } = useExpenseStore();
  const { currentUser } = useUserStore();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paidBy: currentUser?.role === 'partner1' ? 'Andres' : 'Antonio',
    split: 'equal' as const,
    tags: [] as string[],
    isRecurring: false,
    recurringDay: '',
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
    addExpense({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
    });
    navigate('/');
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Expense</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
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

          <div>
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
            <p className="mt-1 text-sm text-gray-500">
              Type to create new tags or select from existing ones
            </p>
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
              className="w-full amount-input"
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
              className="w-full"
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
              className="w-full"
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
              className="w-full"
              required
            >
              <option value="equal">Equal Split</option>
              <option value="no-split">No Split</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700">
                Recurring Expense
              </label>
            </div>

            {formData.isRecurring && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurringDay}
                  onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
                  onWheel={handleWheel}
                  className="w-full"
                  required={formData.isRecurring}
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;