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
      group: cat.groupId
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-7">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2.5">
                  Amount (£)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    onWheel={handleWheel}
                    className={`${inputClassName} pl-12`}
                    placeholder="0.00"
                    required
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="min-w-[88px] px-4 py-2.5 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.category}
              className="min-w-[88px] bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ExpenseForm;
