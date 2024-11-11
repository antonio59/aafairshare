import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import type { Budget, Category } from '../types';
import Dropdown from './common/Dropdown';

interface BudgetEditModalProps {
  budget: Budget;
  onClose: () => void;
}

export default function BudgetEditModal({ budget, onClose }: BudgetEditModalProps) {
  const { updateBudget, categories, categoryGroups } = useExpenseStore();
  const { currentUser } = useUserStore();
  const currencySymbol = currentUser?.preferences.currency === 'GBP' ? '£' : '$';

  const [formData, setFormData] = useState({
    category: budget.category,
    amount: budget.amount ? budget.amount.toString() : '',
    period: budget.period,
  });

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    updateBudget(budget.id, {
      category: formData.category,
      amount,
      period: formData.period,
    });
    onClose();
  };

  // Prevent mouse wheel from changing number input
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const inputClassName = "w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Edit Budget</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              Period
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as Budget['period'] })}
              className={inputClassName}
              required
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[88px] px-4 py-2.5 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-w-[88px] bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
