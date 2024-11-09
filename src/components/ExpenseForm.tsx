import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import Select, { GroupBase, OptionProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { ArrowLeft, Calendar, DollarSign, Tag, Users, RefreshCw } from 'lucide-react';
import type { Expense, Category } from '../types';

const CATEGORY_GROUPS = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Healthcare',
  'Others'
] as const;

type ExpenseFormData = Omit<Expense, 'id'> & {
  isRecurring: boolean;
  recurringDay: string;
};

interface CategoryOption {
  value: string;
  label: string;
  icon?: string;
}

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { addExpense, categories, tags, addTag } = useExpenseStore();
  const { currentUser } = useUserStore();
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    paidBy: currentUser?.role === 'partner1' ? 'Andres' : 'Antonio',
    split: 'equal',
    tags: [],
    isRecurring: false,
    recurringDay: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group categories for the select input
  const groupedCategories = useMemo(() => {
    const groups = CATEGORY_GROUPS.map(group => ({
      label: group,
      options: categories
        .filter(cat => cat.group === group)
        .map(cat => ({
          value: cat.id,
          label: cat.name,
          icon: cat.icon
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addExpense({
        ...formData,
        amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount,
        date: new Date(formData.date).toISOString(),
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to add expense:', error);
      setIsSubmitting(false);
    }
  };

  const handleTagChange = (newValue: any) => {
    setFormData(prev => ({
      ...prev,
      tags: newValue ? newValue.map((v: any) => v.value) : [],
    }));
  };

  const handleCreateTag = async (inputValue: string) => {
    const newTag = {
      name: inputValue,
      categoryId: formData.category,
    };
    
    await addTag(newTag);
    
    // The tag will have an ID after being added to the store
    const addedTag = tags.find(t => t.name === inputValue);
    if (addedTag) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, addedTag.id],
      }));
    }
  };

  // Prevent mouse wheel from changing number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Custom option component to show category icon
  const CategoryOption = ({ data, ...props }: OptionProps<CategoryOption, false, GroupBase<CategoryOption>>) => (
    <div className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100" {...props}>
      {data.icon && <span>{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  );

  const handleCategoryChange = (selectedOption: CategoryOption | null) => {
    setFormData(prev => ({
      ...prev,
      category: selectedOption?.value || ''
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Expense</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select<CategoryOption, false, GroupBase<CategoryOption>>
              value={
                formData.category
                  ? {
                      value: formData.category,
                      label: categories.find(c => c.id === formData.category)?.name || '',
                      icon: categories.find(c => c.id === formData.category)?.icon
                    }
                  : null
              }
              onChange={handleCategoryChange}
              options={groupedCategories}
              components={{ Option: CategoryOption }}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select a category"
              required
              isSearchable
              menuPosition="fixed"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a description..."
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
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Add tags..."
              menuPosition="fixed"
            />
            <p className="mt-1 text-sm text-gray-500">
              Type to create new tags or select from existing ones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (£)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
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
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid By
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="Andres">Andres</option>
                  <option value="Antonio">Antonio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Split
              </label>
              <select
                value={formData.split}
                onChange={(e) => setFormData({ ...formData, split: e.target.value as 'equal' | 'no-split' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="equal">Equal Split</option>
                <option value="no-split">No Split</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recurring Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
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
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
