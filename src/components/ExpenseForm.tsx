import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import type { Expense } from '../types';
import Dropdown from './common/Dropdown';
import TagInput from './common/TagInput';

type ExpenseFormData = Omit<Expense, 'id'> & {
  isRecurring: boolean;
  recurringDay: string;
};

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
    recurringDay: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert categories for the dropdown
  const categoryOptions = categories
    .filter(cat => cat !== null)
    .map(cat => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
      group: cat.group
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      return; // Prevent submission if no category is selected
    }
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

  // Prevent mouse wheel from changing number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid By
              </label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="equal">Equal Split</option>
                <option value="no-split">No Split</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.category}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
