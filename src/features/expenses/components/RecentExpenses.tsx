import React, { _useState, useEffect } from 'react';
import { Edit, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { getExpenses } from '../api/expenseApi';
import { useAuth } from '../../../core/contexts/AuthContext';
import { ErrorBoundary, LoadingSpinner, StatusMessage } from '../../shared/components';
import { useDataCache } from '../../shared/hooks/useDataCache';
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';

/**
 * RecentExpenses component - Displays a list of recent expenses
 * 
 * @param {Object} props
 * @param {Function} props.onViewMore - Function to call when "View all" is clicked
 * @param {any} props.refreshTrigger - Value that triggers a refresh when changed
 * @param {Function} props.onNewExpense - Function to call when "Add your first expense" is clicked
 */
export default function RecentExpenses({ onViewMore, refreshTrigger, onNewExpense }) {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();
  
  // Use our custom hooks for error handling and data caching
  const { 
    error, 
    handleError, _clearError, 
    isLoading, 
    setIsLoading 
  } = useErrorHandler({ context: 'RecentExpenses' });
  
  const { 
    data: expenses, 
    loadData, 
    lastUpdated 
  } = useDataCache('recent_expenses', [], 5); // Cache for 5 minutes
  
  // Load expenses when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        await loadData(async () => {
          return await getExpenses(5); // Get most recent 5 expenses
        });
      } catch (err) {
        handleError(err, 'Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [user, refreshTrigger, loadData]);
  
  // Loading state
  if (isLoading && !expenses.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
        </div>
        
        <div className="p-8 flex justify-center">
          <LoadingSpinner message="Loading expenses..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
        <StatusMessage 
          type="error" 
          message={error} 
        />
        <div className="mt-4 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md shadow-sm transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
        <div className="py-8">
          <div className="bg-gray-100 inline-flex p-4 mb-4 rounded-full">
            <Receipt size={24} className="text-gray-500" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sign in to track expenses</h3>
          <p className="text-gray-600 mb-4">Start tracking your shared expenses and make splitting bills easier.</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
        <div className="py-8">
          <div className="bg-gray-100 inline-flex p-4 mb-4 rounded-full">
            <Receipt size={24} className="text-gray-500" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No expenses yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your shared expenses and make splitting bills easier.</p>
          <button 
            onClick={onNewExpense}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md shadow-sm transition-colors"
            aria-label="Add your first expense"
          >
            Add your first expense
          </button>
        </div>
      </div>
    );
  }
  
  // Success state with data
  return (
    <ErrorBoundary 
      title="Error Loading Expenses" 
      message="We're having trouble showing your recent expenses." 
      onReset={() => window.location.reload()}
    >
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={onViewMore}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            aria-label="View all expenses"
          >
            View all
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/expenses/${expense.id}`)}
              role="button"
              tabIndex="0"
              aria-label={`View expense: ${expense.category || 'Uncategorized'} for ${formatAmount(expense.amount)}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/expenses/${expense.id}`);
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Edit size={20} className="text-gray-400" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{expense.category || 'Uncategorized'}</p>
                  {expense.location && (
                    <p className="text-sm text-gray-500">{expense.location}</p>
                  )}
                  {expense.notes && (
                    <p className="text-sm text-gray-500">{expense.notes}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Paid by {expense.users?.name || 'Unknown'} • Split: {expense.split_type || 'equal'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatAmount(expense.amount)}</p>
                <p className="text-sm text-gray-500">{new Date(expense.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}