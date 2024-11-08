import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useExpenseStore } from '../../store/expenseStore';
import type { RecurringExpense } from '../../types';
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

const RecurringExpenses = () => {
  const { categories, tags, recurringExpenses, addRecurringExpense, updateRecurringExpense, deleteRecurringExpense, addTag } = useExpenseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    dayOfMonth: '1',
    frequency: 'monthly' as const,
    paidBy: 'Andres',
    split: 'equal' as const,
    tags: [] as string[],
  });

  // Group categories for the select input
  const groupedCategories = useMemo(() => 
    CATEGORY_GROUPS.map(group => ({
      label: group,
      options: categories
        .filter(cat => cat.group === group)
        .map(cat => ({
          value: cat.id,
          label: cat.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    })).filter(group => group.options.length > 0)
  , [categories]);

  // Convert tags for the select input
  const tagOptions = useMemo(() => 
    tags.map(tag => ({
      value: tag.id,
      label: tag.name,
    })),
    [tags]
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
    });
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      deleteRecurringExpense(id);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expense = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      paidBy: formData.paidBy,
      split: formData.split,
      dayOfMonth: parseInt(formData.dayOfMonth),
      frequency: formData.frequency,
      tags: formData.tags,
    };

    if (editingExpense) {
      updateRecurringExpense(editingExpense.id, expense);
    } else {
      addRecurringExpense(expense);
    }

    setIsModalOpen(false);
    setEditingExpense(null);
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
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-gray-50 rounded"
              >
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{expense.description || 'Untitled Expense'}</span>
                    <span className="text-sm text-blue-600">
                      {category?.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    £{expense.amount.toFixed(2)} • {expense.frequency} • 
                    Day {expense.dayOfMonth} • Paid by {expense.paidBy}
                  </p>
                  {expenseTags && expenseTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expenseTags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                    aria-label="Edit expense"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
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
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold">
                {editingExpense ? 'Edit' : 'Add'} Recurring Expense
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full"
                  />
                </div>

                {/* Category Field */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select
                    id="category"
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
                    required
                  />
                </div>

                {/* Tags Field */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <CreatableSelect
                    isMulti
                    id="tags"
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

                {/* Amount Field */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (£)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    onWheel={handleWheel}
                    className="w-full amount-input"
                    required
                  />
                </div>

                {/* Frequency and Day of Month */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-1">
                      Day of Month
                    </label>
                    <input
                      type="number"
                      id="dayOfMonth"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      onWheel={handleWheel}
                      className="w-full amount-input"
                      required
                    />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
                      Paid By
                    </label>
                    <select
                      id="paidBy"
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
                    <label htmlFor="split" className="block text-sm font-medium text-gray-700 mb-1">
                      Split
                    </label>
                    <select
                      id="split"
                      value={formData.split}
                      onChange={(e) => setFormData({ ...formData, split: e.target.value as any })}
                      className="w-full"
                      required
                    >
                      <option value="equal">Equal Split</option>
                      <option value="no-split">No Split</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
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