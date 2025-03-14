import React, { useState, useEffect, memo, useMemo, useRef, useCallback } from 'react';
import { Edit, Receipt, Calendar, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Search, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { formatAmount, formatCurrency } from '../../../utils/currencyUtils';
import { calculateUserBalances } from '../../settlements/api/settlement-operations';
import { useAuth } from '../../../core/contexts/AuthContext';
import { deleteExpense, invalidateExpensesCache } from '../api/expenseApi';
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import { ErrorBoundary, LoadingSpinner, StatusMessage } from '../../shared/components';
import { formatDateToUK, formatTime, MONTHS, getYear } from '../../shared/utils/date-utils';
import { formatDecimal, safeSum } from '../../../utils/number-utils';
import { supabase } from '../../../core/api/supabase';
import { Expense, GroupedExpenses, MonthlyExpenseData, ApiResponse } from '../../../core/types/expenses';
import { sanitizeAmount, isEmpty } from '../../../core/utils/validation';

// Component props types
interface ExpenseCardProps {
  expense: Expense;
  formatCurrency: (amount: number | string) => string;
  onDelete: (id: string, canDelete: boolean) => void;
  onEdit: (e: React.MouseEvent, expense: Expense) => void;
  onClick: (expense: Expense) => void;
}

interface DailyExpensesGroupProps {
  date: string;
  expenses: Expense[];
  formatCurrency: (value: number | string) => string;
  onDelete: (id: string, _isPaidByCurrentUser: boolean) => void;
  onEdit: (e: React.MouseEvent, expense: Expense) => void;
  onExpenseClick: (expense: Expense) => void;
}

interface EmptyStateProps {
  month: number;
  year: number;
  onNewExpense: () => void;
}

interface VirtualRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Expense[];
    formatCurrency: (value: number | string) => string;
    onDelete: (id: string, _isPaidByCurrentUser: boolean) => void;
    onEdit: (e: React.MouseEvent, expense: Expense) => void;
    onExpenseClick: (expense: Expense) => void;
  };
}

interface MonthlyExpensesProps {
  onViewMore?: () => void;
  refreshTrigger?: number;
  onNewExpense: () => void;
}

interface ExportOptions {
  title?: string;
  dateRange: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  fileName?: string;
}

function createCSVContent(expenses: Expense[], dateRange: string): string {
  const csvRows: string[][] = [];
  
  // Add header
  csvRows.push(['AAFairShare Expense Report']);
  csvRows.push(['Generated on:', new Date().toLocaleDateString()]);
  csvRows.push(['Date Range:', dateRange]);
  csvRows.push(['']);
  
  // Add expense data
  csvRows.push(['Date', 'Category', 'Amount', 'Paid By', 'Location', 'Notes']);
  
  expenses.forEach(expense => {
    csvRows.push([
      new Date(expense.date).toLocaleDateString(),
      expense._category || 'Uncategorized',
      expense.amount.toString(),
      expense.paid_by_name || 'Unknown',
      expense._location || '',
      expense.notes || ''
    ]);
  });
  
  return csvRows.map(row => 
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;      }
      return cell;
    }).join(',')
  ).join('\n');
}

/**
 * Helper function to safely sum expense amounts
 * @param expenses Array of expenses to sum
 * @returns Total amount as number
 */
const sumExpenses = (expenses: Expense[]): number => {
  if (!Array.isArray(expenses)) {
    return 0;
  }
  
  return expenses.reduce((total, expense) => {
    // Skip invalid expenses
    if (!expense?.amount) return total;
    
    const amount = sanitizeAmount(expense.amount) ?? 0;
    return total + amount;
  }, 0);
};

/**
 * Type guard function for expense objects
 * @param expense The expense to validate
 * @returns Type guard boolean
 */
function isValidExpense(expense: any): expense is Expense {
  return (
    expense !== null &&
    typeof expense === 'object' &&
    'id' in expense &&
    typeof expense.id === 'string' &&
    'date' in expense &&
    'amount' in expense
  );
}

/**
 * Search function to check if an expense matches a query
 * @param expense The expense to search
 * @param query The search query
 * @returns Whether the expense matches the query
 */
function matchesSearchQuery(expense: Expense, query: string): boolean {
  if (!query) return true;
  
  const searchLower = query.toLowerCase();
  
  return (
    (expense._category?.toLowerCase().includes(searchLower) ?? false) ||
    ((!isEmpty(expense.notes) && expense.notes?.toLowerCase().includes(searchLower)) ?? false) ||
    (expense._location?.toLowerCase().includes(searchLower) ?? false) ||
    (expense.paid_by_name?.toLowerCase().includes(searchLower) ?? false)
  );
}

// Memoized expense card component
const ExpenseCard = memo(({ expense, formatCurrency, onDelete, onEdit, onClick }: ExpenseCardProps) => {
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(e, expense);
  }, [onEdit, expense]);
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(expense.id, !!expense.isOwner);
  }, [onDelete, expense.id, expense.isOwner]);
  
  const handleClick = useCallback(() => {
    onClick(expense);
  }, [onClick, expense]);
  
  return (
    <div 
      className="py-2 md:py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-800 text-sm md:text-base">
            {expense._category || 'Uncategorized'}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            {expense.paid_by_name || 'Unknown'}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <div className={`font-semibold text-sm md:text-base ${expense.isOwner ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(expense.amount)}
            </div>
            {expense.split_type && (
              <div className="text-xs text-gray-500">
                {expense.split_type === 'equal' ? 'Split 50/50' : '100%'}
              </div>
            )}
          </div>
          
          <div className="flex">
            <button 
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              onClick={handleEdit}
              aria-label="Edit expense"
              type="button"
            >
              <Edit size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
            
            {expense.isOwner && (
              <button 
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleDelete}
                aria-label="Delete expense"
                type="button"
              >
                <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {!isEmpty(expense.notes) && (
        <div className="mt-1 text-xs md:text-sm text-gray-500 truncate max-w-full">
          {expense.notes}
        </div>
      )}
      
      {expense._location && (
        <div className="text-xs text-gray-400">
          {expense._location}
        </div>
      )}
    </div>
  );
});

ExpenseCard.displayName = 'ExpenseCard';

// Virtual row renderer for efficient list rendering
const VirtualRow = memo(({ index, style, data }: VirtualRowProps) => {
  const expense = data.items[index];
  if (!expense) return null;
  
  return (
    <div style={style}>
      <ExpenseCard
        expense={expense}
        formatCurrency={data.formatCurrency}
        onDelete={data.onDelete}
        onEdit={data.onEdit}
        onClick={data.onExpenseClick}
      />
    </div>
  );
});

VirtualRow.displayName = 'VirtualRow';

// Daily expense group component
const DailyExpensesGroup = memo(({ date, expenses, formatCurrency, onDelete, onEdit, onExpenseClick }: DailyExpensesGroupProps) => {
  const EXPENSE_ROW_HEIGHT = 70; // Smaller on mobile, larger on desktop
  const EXPENSE_THRESHOLD = 5; // Use virtualization for more than 5 expenses
  
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex items-center mb-2">
        <Calendar size={14} className="text-gray-400 mr-2 md:w-4 md:h-4" />
        <div className="text-sm md:text-base text-gray-600 font-medium">{date}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 md:px-4">
          {expenses.length <= EXPENSE_THRESHOLD ? (
            // Render normally for small lists
            <div>
              {expenses.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  formatCurrency={formatCurrency}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onClick={onExpenseClick}
                />
              ))}
            </div>
          ) : (
            // Use virtualized list for large lists
            <div style={{ height: Math.min(expenses.length * EXPENSE_ROW_HEIGHT, 400) }}>
              <AutoSizer>
                {({ height, width }: { height: number, width: number }) => (
                  <List
                    height={height}
                    width={width}
                    itemCount={expenses.length}
                    itemSize={EXPENSE_ROW_HEIGHT}
                    itemData={{
                      items: expenses,
                      formatCurrency,
                      onDelete,
                      onEdit,
                      onExpenseClick
                    }}
                  >
                    {VirtualRow}
                  </List>
                )}
              </AutoSizer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DailyExpensesGroup.displayName = 'DailyExpensesGroup';

// Empty state component
const EmptyState = memo(({ month, year, onNewExpense }: EmptyStateProps) => (
  <div className="py-8 md:py-12 bg-white rounded-lg shadow text-center">
    <div className="text-gray-300 mb-3 md:mb-4">
      <Receipt size={40} className="mx-auto md:w-12 md:h-12" />
    </div>
    <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2">No expenses for {MONTHS[month]} {year}</h3>
    <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">Start tracking your expenses for this month</p>
    <button
      onClick={onNewExpense}
      className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
      type="button"
    >
      Add Your First Expense
    </button>
  </div>
));

EmptyState.displayName = 'EmptyState';

/**
 * Main MonthlyExpenses component
 */
function MonthlyExpenses({ onViewMore, refreshTrigger = 0, onNewExpense }: MonthlyExpensesProps) {
  const navigate = useNavigate();
  // currencyContext is replaced with direct imports
const currency = "GBP";
  const errorTimeoutRef = useRef<number | null>(null);
  
  // Format currency helper
  const formatCurrency = useCallback((value: number | string): string => {
    if (typeof value === 'string') {
      value = parseFloat(value) || 0;
    }
    return formatAmount(value);
  }, []);
  
  const { user, refreshSession } = useAuth();
  const { handleError } = useErrorHandler();

  // Track component mount state
  const mountedRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  
  // Date state
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMonthlyData, setAllMonthlyData] = useState<MonthlyExpenseData[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  // Get current month data
  const currentMonthData = useMemo(() => {
    const monthStr = `${MONTHS[selectedDate.month]} ${selectedDate.year}`;
    return allMonthlyData.find(month => month.month === monthStr) || { 
      month: monthStr,
      expenses: [],
      total: 0
    };
  }, [allMonthlyData, selectedDate.month, selectedDate.year]);
  
  // Sort expenses
  const sortedExpenses = useMemo(() => {
    if (!Array.isArray(currentMonthData.expenses) || !currentMonthData.expenses.length) {
      return [];
    }

    return [...currentMonthData.expenses].sort((a: Expense, b: Expense) => {
      if (sortBy === 'amount') {
        const aAmount = typeof a.amount === 'string' ? parseFloat(a.amount) : a.amount;
        const bAmount = typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount;
        return sortOrder === 'asc' ? aAmount - bAmount : bAmount - aAmount;
      }
      
      // Default sort by date
      return sortOrder === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [currentMonthData.expenses, sortBy, sortOrder]);
  
  // Filter expenses
  const filteredExpenses = useMemo(() => {
    if (!sortedExpenses.length) return [];
    
    return sortedExpenses.filter((expense: Expense) => {
      // Search filter
      if (searchQuery && !matchesSearchQuery(expense, searchQuery)) {
        return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0 && expense._category) {
        if (!selectedCategories.includes(expense._category)) {
          return false;
        }
      }
      
      return true;
    });
  }, [sortedExpenses, searchQuery, selectedCategories]);
  
  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    if (!filteredExpenses.length) {
      return {} as GroupedExpenses;
    }

    return filteredExpenses.reduce((acc, expense) => {
      if (!expense?.date) return acc;
      
      const dateKey = formatDateToUK(expense.date);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(expense);
      return acc;
    }, {} as GroupedExpenses);
  }, [filteredExpenses]);
  
  /**
   * Error handling function
   * @param message Error message to display
   */
  const showError = useCallback((message: string) => {
    setError(message);
    
    // Auto-clear error after 5 seconds
    if (errorTimeoutRef.current !== null) {
      window.clearTimeout(errorTimeoutRef.current);
    }
    
    errorTimeoutRef.current = window.setTimeout(() => {
      setError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  }, []);
  
  /**
   * Load expenses data from API
   */
  const loadData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get data for the last 3 months
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      const startDate = threeMonthsAgo.toISOString().split('T')[0];
      
      // Add timeout protection
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });
      
      // Get user balances with expenses
      const calculationPromise = calculateUserBalances({
        startDate,
        limit: 200
      });
      
      const result = await Promise.race([
        calculationPromise,
        timeoutPromise
      ]) as any;
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      if (mountedRef.current) {
        setAllMonthlyData(result.monthlyExpenses || []);
        
        // Extract unique categories
        const categories = new Set<string>();
        result.monthlyExpenses?.forEach((month: any) => {
          if (month && Array.isArray(month.expenses)) {
            month.expenses.forEach((expense: any) => {
              if (isValidExpense(expense) && expense._category) {
                categories.add(expense._category);
              }
            });
          }
        });
        
        setAllCategories(Array.from(categories));
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load expenses data:', error);
      
      if (mountedRef.current) {
        showError('Failed to load expenses data. Please try refreshing.');
        setLoading(false);
        
        // Try to refresh session on error
        try {
          await refreshSession();
        } catch (refreshError) {
          console.error('Failed to refresh session:', refreshError);
        }
      }
    }
  }, [refreshSession, showError]);
  
  /**
   * Set up Supabase subscription for real-time updates
   */
  const setupSubscription = useCallback(async () => {
    if (!mountedRef.current || subscriptionRef.current) return;
    
    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      console.log('Cannot set up subscription: user not authenticated');
      return;
    }
    
    try {
      // Clean up existing subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Create a unique channel
      const channelName = `expenses-changes-${currentUser.id}-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'expenses',
            filter: `paid_by=eq.${currentUser.id}`
          }, 
          (payload) => {
            if (!mountedRef.current) return;
            
            // Refresh data on any change
            if (['INSERT', 'DELETE', 'UPDATE'].includes(payload.eventType)) {
              loadData();
            }
          }
        )
        .subscribe();
        
      // Store reference for cleanup
      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Failed to set up subscription:', error);
      
      // Retry after a delay on failure
      if (mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current && !subscriptionRef.current) {
            setupSubscription();
          }
        }, 5000);
      }
    }
  }, [loadData]);
  
  /**
   * Handle expense deletion
   */
  const handleDelete = useCallback(async (expenseId: string, _isPaidByCurrentUser: boolean) => {
    if (!expenseId || !mountedRef.current) return;
    
    try {
      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this expense?')) {
        return;
      }
      
      // Show temporary message
      showError('Deleting expense...');
      
      const result = await deleteExpense(expenseId) as ApiResponse<null>;
      
      if (result.success && mountedRef.current) {
        showError('Expense deleted successfully');
        await loadData();
      } else if (mountedRef.current) {
        showError(result.message || 'Failed to delete expense');
      }
    } catch (err: any) {
      if (mountedRef.current) {
        showError(`Error deleting expense: ${err.message || 'Unknown error'}`);
      }
    }
  }, [loadData, showError]);
  
  /**
   * Navigate to previous month
   */
  const handlePrevMonth = useCallback(() => {
    setSelectedDate(prev => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      
      return { month: newMonth, year: newYear };
    });
  }, []);
  
  /**
   * Navigate to next month
   */
  const handleNextMonth = useCallback(() => {
    setSelectedDate(prev => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      
      return { month: newMonth, year: newYear };
    });
  }, []);
  
  // UI state handlers
  const toggleFilters = useCallback(() => setShowFilters(prev => !prev), []);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
    setSearchQuery(e.target.value), []);
  
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);
  
  const handleSortChange = useCallback((field: string) => {
    setSortBy(prevSortBy => {
      if (prevSortBy === field) {
        // Toggle order if same field
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        return field;
      }
      // Default to descending for new sort field
      setSortOrder('desc');
      return field;
    });
  }, []);
  
  // Navigation handlers
  const handleEditClick = useCallback((e: React.MouseEvent, expense: Expense) => {
    e.stopPropagation();
    navigate(`/expenses/edit/${expense.id}`);
  }, [navigate]);
  
  const handleExpenseClick = useCallback((expense: Expense) => {
    navigate(`/expenses/${expense.id}`);
  }, [navigate]);
  
  // Initial data loading
  useEffect(() => {
    mountedRef.current = true;
    
    // Load data and set up subscription
    loadData().catch(err => {
      console.error('Initial data load error:', err);
      if (mountedRef.current) {
        showError(`Failed to load initial data: ${err.message || 'Unknown error'}`);
      }
    });
    
    setupSubscription().catch(err => {
      console.error('Error setting up subscription:', err);
    });
    
    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      
      // Clear timeouts
      if (errorTimeoutRef.current !== null) {
        window.clearTimeout(errorTimeoutRef.current);
      }
      
      // Clean up subscription
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
        subscriptionRef.current = null;
      }
    };
  }, [loadData, setupSubscription, showError]);
  
  // Refresh data when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0 && mountedRef.current) {
      // Use a small delay
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          // Invalidate cache first
          invalidateExpensesCache();
          loadData().catch(err => {
            console.error('Error reloading data after trigger:', err);
            if (mountedRef.current) {
              showError('Failed to refresh expenses data');
            }
          });
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [refreshTrigger, loadData, showError]);
  
  // Month title and navigation
  const renderMonthTitle = useMemo(() => (
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <button 
        onClick={handlePrevMonth}
        className="text-gray-400 hover:text-gray-600 p-1.5 md:p-2"
        aria-label="Previous month"
        type="button"
      >
        <ChevronLeft size={20} className="md:w-6 md:h-6" />
      </button>
      
      <h2 className="text-lg md:text-xl font-semibold">
        {MONTHS[selectedDate.month]} {selectedDate.year}
      </h2>
      
      <button 
        onClick={handleNextMonth}
        className="text-gray-400 hover:text-gray-600 p-1.5 md:p-2"
        aria-label="Next month"
        type="button"
      >
        <ChevronRight size={20} className="md:w-6 md:h-6" />
      </button>
    </div>
  ), [selectedDate.month, selectedDate.year, handlePrevMonth, handleNextMonth]);
  
  // Filters UI
  const renderFilters = useMemo(() => (
    <div className={`mb-4 md:mb-6 ${showFilters ? 'block' : 'hidden'}`}>
      <div className="bg-white p-3 md:p-4 rounded-lg shadow">
        <div className="mb-3 md:mb-4">
          <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
            Search
          </label>
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search expenses..."
              className="flex-grow p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="p-2 bg-gray-50">
              <Search size={14} className="text-gray-400 md:w-4 md:h-4" />
            </div>
          </div>
        </div>
        
        {allCategories.length > 0 && (
          <div className="mb-3 md:mb-4">
            <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
              Categories
            </label>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
            Sort By
          </label>
          <div className="flex gap-1.5 md:gap-2">
            <button
              onClick={() => handleSortChange('date')}
              className={`text-xs px-2 py-1 rounded-md flex items-center ${
                sortBy === 'date'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              type="button"
            >
              Date
              {sortBy === 'date' && (
                <ArrowUpDown size={10} className="ml-1 md:w-3 md:h-3" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('amount')}
              className={`text-xs px-2 py-1 rounded-md flex items-center ${
                sortBy === 'amount'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              type="button"
            >
              Amount
              {sortBy === 'amount' && (
                <ArrowUpDown size={10} className="ml-1 md:w-3 md:h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [
    showFilters, 
    searchQuery, 
    allCategories, 
    selectedCategories, 
    sortBy,
    handleSearchChange,
    handleCategoryChange,
    handleSortChange
  ]);
  
  // Expenses content
  const renderExpenses = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8 md:py-12">
          <LoadingSpinner message="Loading expenses..." />
        </div>
      );
    }
    
    if (!filteredExpenses.length) {
      return (
        <EmptyState
          month={selectedDate.month}
          year={selectedDate.year}
          onNewExpense={onNewExpense}
        />
      );
    }
    
    const dateGroups = Object.keys(groupedExpenses).sort((a, b) => {
      // Sort dates in descending order (newest first)
      const dateA = new Date(a.split('/').reverse().join('/'));
      const dateB = new Date(b.split('/').reverse().join('/'));
      return dateB.getTime() - dateA.getTime();
    });
    
    return (
      <div>
        {dateGroups.map(date => (
          <DailyExpensesGroup
            key={date}
            date={date}
            expenses={groupedExpenses[date]}
            formatCurrency={formatCurrency}
            onDelete={handleDelete}
            onEdit={handleEditClick}
            onExpenseClick={handleExpenseClick}
          />
        ))}
      </div>
    );
  }, [
    loading,
    filteredExpenses, 
    groupedExpenses, 
    selectedDate.month, 
    selectedDate.year, 
    formatCurrency, 
    onNewExpense,
    handleDelete,
    handleEditClick,
    handleExpenseClick
  ]);
  
  return (
    <ErrorBoundary fallback={<div>Something went wrong with expenses</div>}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 md:p-6">
        {renderMonthTitle}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <h3 className="text-xs md:text-sm font-medium text-gray-600">
            {filteredExpenses.length || 0} expense(s) this month
            {filteredExpenses.length > 0 && (
              <span className="ml-2">
                • Total: <span className="font-semibold">{formatCurrency(sumExpenses(filteredExpenses))}</span>
              </span>
            )}
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const dateRange = `${MONTHS[selectedDate.month]} ${selectedDate.year}`;
                const csvContent = createCSVContent(filteredExpenses, dateRange);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `expenses_${dateRange.toLowerCase().replace(' ', '_')}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 text-xs md:text-sm"
              type="button"
            >
              <Download size={12} className="md:w-4 md:h-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={toggleFilters}
              className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 text-xs md:text-sm"
              type="button"
            >
              <Filter size={12} className="md:w-4 md:h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>
        </div>
        
        {renderFilters}
        
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            <div className="flex items-center">
              <div className="font-medium">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700 text-xs md:text-sm"
                type="button"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {renderExpenses}
        
        {onViewMore && filteredExpenses.length > 0 && (
          <div className="text-center mt-4 md:mt-6">
            <button
              onClick={onViewMore}
              className="text-blue-500 hover:text-blue-700 font-medium text-xs md:text-sm"
              type="button"
            >
              View all expenses
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default MonthlyExpenses;