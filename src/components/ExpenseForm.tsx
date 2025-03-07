import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { useUserStore } from '@/store/userStore';
import { ArrowLeft, Calendar, HelpCircle } from 'lucide-react';
import type { Expense, Category, ExpenseFormData } from '@/types';
import Dropdown from '@/components/common/Dropdown';
import TagInput from '@/components/common/TagInput';

// Extend the base expense type to include form-specific fields
// type ExpenseFormData = Omit<Expense, 'id' | 'amount'> & {
//   amount: string; // Handle amount as string in form state
//   isRecurring: boolean;
//   recurringDay: string;
// };

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { addExpense, categories, categoryGroups, tags, addTag } = useExpenseStore();
  const { currentUser } = useUserStore();
  const currencySymbol = currentUser?.preferences.currency === 'GBP' ? '£' : '$';

  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paidBy: currentUser?.role === 'partner1' ? 'Andres' : 'Antonio',
    split: 'equal',
    tags: [],
    isRecurring: false,
    recurringDay: '1',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('Available Categories:', categories);
    console.log('Available Category Groups:', categoryGroups);
  }, [categories, categoryGroups]);

  // Convert categories for the dropdown with proper deduplication and filtering
  const categoryOptions = categories
    .filter((cat): cat is Category => {
      if (!cat) {
        console.warn('Found null category');
        return false;
      }
      const group = categoryGroups.find(g => g.id === cat.groupId);
      if (!group) {
        console.warn('Category without valid group:', cat);
        return false;
      }
      return true;
    })
    .map(cat => {
      const group = categoryGroups.find(g => g.id === cat.groupId)!;
      console.log('Mapping category:', cat.name, 'to group:', group.name);
      return {
        value: cat.id,
        label: cat.name,
        icon: cat.icon,
        group: group.name
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      return; // Prevent submission if no category is selected
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting expense with category:', formData.category);
      await addExpense({
        description: formData.description,
        amount,
        date: new Date(formData.date).toISOString(),
        category: formData.category,
        paidBy: formData.paidBy,
        split: formData.split,
        tags: formData.tags,
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to add expense:', error);
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData((prev: ExpenseFormData) => ({ ...prev, amount: value }));
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
        setFormData((prev: ExpenseFormData) => ({
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

  const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <div className="flex items-center gap-2 mb-2.5">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <div className="group relative">
        <HelpCircle className="w-4 h-4 text-gray-400" />
        <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-10">
          {tooltip}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
    </div>
  );

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
            <div>
              <LabelWithTooltip 
                label="Category"
                tooltip="Select the expense type."
              />
              <Dropdown
                value={formData.category}
                onChange={(value) => {
                  console.log('Selected category:', value);
                  setFormData((prev: ExpenseFormData) => ({ ...prev, category: value as string }));
                }}
                options={categoryOptions}
                placeholder="Select a category"
                required
                groupBy
              />
            </div>

            <div>
              <LabelWithTooltip 
                label="Tags"
                tooltip="Add an identifier to tag an expense (e.g., Category: Food, Tag: Tesco)."
              />
              <TagInput
                value={formData.tags}
                onChange={(tagIds) => {
                  setFormData((prev: ExpenseFormData) => ({ ...prev, tags: tagIds }));
                }}
                onCreateTag={handleCreateTag}
                availableTags={tags}
                placeholder="Add tags..."
              />
            </div>

            <div>
              <LabelWithTooltip 
                label="Description (Optional)"
                tooltip="Add notes or additional details about the expense."
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClassName}
                placeholder="Add a description..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <span>Add</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ExpenseForm;
