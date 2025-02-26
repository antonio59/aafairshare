import { useState, useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { Calendar, HelpCircle } from 'lucide-react';
import type { Expense, Category } from '../types';
import Dropdown from './common/Dropdown';
import TagInput from './common/TagInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';

interface ExpenseEditModalProps {
  expense: Expense | null; // Allow expense to be null
  open: boolean;
  onClose: () => void;
}

const ExpenseEditModal = ({ expense, open, onClose }: ExpenseEditModalProps) => {
  const { updateExpense, categories, categoryGroups, tags, addTag } = useExpenseStore();
  const { currentUser } = useUserStore();
  const currencySymbol = currentUser?.preferences.currency === 'GBP' ? '£' : '$';

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    category: '',
    paidBy: '',
    split: 'equal' as 'equal' | 'no-split',
    tags: [] as string[],
  });

  // Initialize form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount ? expense.amount.toString() : '',
        date: new Date(expense.date).toISOString().split('T')[0],
        category: expense.category || '',
        paidBy: expense.paidBy || '',
        split: expense.split || 'equal',
        tags: expense.tags || [],
      });
    }
  }, [expense]);

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

    if (expense) {
      updateExpense(expense.id, {
        ...formData,
        amount,
        date: new Date(formData.date).toISOString(),
      });
    }
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

  const LabelWithTooltip = ({ label, tooltip }: { label: string; tooltip: string }) => (
    <div className="flex items-center gap-2 mb-2.5">
      <label className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <div className="group relative">
        <HelpCircle className="w-4 h-4 text-gray-400" />
        <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-20">
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
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>

          <form id="expense-form" onSubmit={handleSubmit} className="space-y-8 mt-4">
              <div className="space-y-7">
                <div>
                  <LabelWithTooltip 
                    label="Category"
                    tooltip="Select the expense type."
                  />
                  <Dropdown
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                    onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
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
          <DialogFooter className="mt-6">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseEditModal;