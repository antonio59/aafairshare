'use client';

import React, { useState, useEffect } from 'react';
import { Target, X, DollarSign, Save } from 'lucide-react';
import { useCurrency } from '../../../core/contexts/CurrencyContext';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (budgetAmount: number) => Promise<void>;
}

export function BudgetSettingsModal({
  isOpen,
  onClose,
  currentBudget,
  onSave
}: BudgetSettingsModalProps) {
  const [budgetAmount, setBudgetAmount] = useState<string>(currentBudget.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const { _formatAmount, currency } = useCurrency();

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setBudgetAmount(currentBudget.toString());
      setError('');
    }
  }, [isOpen, currentBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate input
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(amount);
      onClose();
    } catch (err) {
      setError('Failed to save budget. Please try again.');
      console.error('Error saving budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Target className="mr-2 h-5 w-5 text-rose-500" />
            Monthly Budget Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Budget Target
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 text-gray-900"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">{currency}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Set your target spending limit for each month
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 