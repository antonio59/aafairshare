import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { Edit, Receipt, Calendar, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { calculateUserBalances } from '../../settlements/api/settlement-operations';
import { useAuth } from '../../../core/contexts/AuthContext';
import { deleteExpense, invalidateExpensesCache } from '../api/expenseApi';
import { useErrorHandler } from '../../shared/hooks/useErrorHandler';
import { ErrorBoundary, LoadingSpinner, StatusMessage } from '../../shared/components';
import { formatDateToUK, formatTime, MONTHS, getYear } from '../../shared/utils/date-utils';
import { formatDecimal, safeSum } from '../../../utils/number-utils';
import { supabase } from '../../../core/api/supabase';

// Type definitions to fix linter errors
interface Expense {
  id: string;
  date: string;
  amount: number | string;
  category?: string;
  location?: string;
  notes?: string;
  isPaidByCurrentUser?: boolean;
  paidByName?: string;
  splitType?: string;
}

interface ExpenseCardProps {
  expense: Expense;
  formatCurrency: (value: number | string) => string;
  onDelete: (id: string, _isPaidByCurrentUser: boolean) => void;
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

// Improve the sumExpenses function with better type safety
const sumExpenses = (expenses: Expense[]): number => {
  // Handle null/undefined array
  if (!Array.isArray(expenses)) {
    return 0;
  }
  
  return expenses.reduce((total, expense) => {
    // Skip invalid expenses
    if (!expense || typeof expense !== 'object' || !('amount' in expense)) {
      return total;
    }
    
    const amount = typeof expense.amount === 'string' 
      ? parseFloat(expense.amount) 
      : (typeof expense.amount === 'number' ? expense.amount : 0);
    
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);
};

// Add more robust type guard function for expense objects
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

// Create memoized sub-components to prevent unnecessary re-renders

// Memoized expense card component with updated clean design
const ExpenseCard = memo(({ expense, formatCurrency, onDelete, onEdit, onClick }: ExpenseCardProps) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(e, expense);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(expense.id, !!expense.isPaidByCurrentUser);
  };
  
  const handleClick = () => {
    onClick(expense);
  };
  
  return (
    <div 
      className="py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium text-gray-800">
            {expense.category || 'Uncategorized'}
          </div>
          <div className="text-sm text-gray-500">
            {expense.paidByName || 'Unknown'}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <div className={`font-semibold ${expense.isPaidByCurrentUser ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(expense.amount)}
            </div>
            {expense.splitType && (
              <div className="text-xs text-gray-500">
                Split {expense.splitType === 'equal' ? '50/50' : expense.splitType}
              </div>
            )}
          </div>
          
          <div className="flex">
            <button 
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              onClick={handleEdit}
              aria-label="Edit expense"
            >
              <Edit size={18} />
            </button>
            
            {expense.isPaidByCurrentUser && (
              <button 
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                onClick={handleDelete}
                aria-label="Delete expense"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {expense.notes && (
        <div className="mt-1 text-sm text-gray-500 truncate max-w-full">
          {expense.notes}
        </div>
      )}
      
      {expense.location && (
        <div className="text-xs text-gray-400">
          {expense.location}
        </div>
      )}
    </div>
  );
});

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

// Memoized daily expense group component with updated clean design
const DailyExpensesGroup = memo(({ date, expenses, formatCurrency, onDelete, onEdit, onExpenseClick }: DailyExpensesGroupProps) => {
  const EXPENSE_ROW_HEIGHT = 80; // Adjusted height for the new cleaner design
  const EXPENSE_THRESHOLD = 5; // Use virtualization for more than 5 expenses
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Calendar size={16} className="text-gray-400 mr-2" />
        <div className="text-gray-600 font-medium">{date}</div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4">
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
            <div style={{ height: Math.min(expenses.length * EXPENSE_ROW_HEIGHT, 500) }}>
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

// Memoized empty state component with updated clean design
const EmptyState = memo(({ month, year, onNewExpense }: EmptyStateProps) => (
  <div className="py-12 bg-white rounded-lg shadow text-center">
    <div className="text-gray-300 mb-4">
      <Receipt size={48} className="mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-800 mb-2">No expenses for {MONTHS[month]} {year}</h3>
    <p className="text-gray-500 mb-6">Start tracking your expenses for this month</p>
    <button
      onClick={onNewExpense}
      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
    >
      Add Your First Expense
    </button>
  </div>
));

// Update the interface to match the actual context
interface CurrencyContextValue {
  currency: string;
  setCurrency: (currency: string) => void;
  supportedCurrencies: Record<string, { symbol: string; name: string }>;
  formatAmount: (amount: number) => string;
}

// Main component with optimizations
const MonthlyExpenses = ({ onViewMore, refreshTrigger = 0, onNewExpense }: MonthlyExpensesProps) => {
  console.log("MonthlyExpenses component rendering");
  const navigate = useNavigate();
  
  // Use the CurrencyContext with its actual type and methods
  const currencyContext = useCurrency();
  
  // Add an error timeout ref for clearing errors automatically
  const errorTimeoutRef = useRef<number | null>(null);
  
  // Create our own formatCurrency function using the context's formatAmount
  const formatCurrency = (value: number | string): string => {
    try {
      // Convert string values to numbers for the formatAmount function
      const numericValue = typeof value === 'string' ? parseFloat(value) : value;
      
      // Use the context's formatAmount if available, or provide a fallback
      if (currencyContext && typeof currencyContext.formatAmount === 'function') {
        return currencyContext.formatAmount(isNaN(numericValue) ? 0 : numericValue);
      }
      
      // Fallback formatter if context not available
      return `£${isNaN(numericValue) ? 0 : numericValue.toFixed(2)}`;
    } catch (err) {
      // If anything goes wrong, return a safe default
      console.error('Error formatting currency:', err);
      return `£0.00`;
    }
  };
  
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  // Track component mount state with a ref
  const mountedRef = useRef(false);
  const subscriptionRef = useRef<any>(null);
  
  // Simple date state
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
  
  // Data state - simplified
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allMonthlyData, setAllMonthlyData] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  // Get the current selected month's data - memoized
  const currentMonthData = useMemo(() => {
    console.log('Finding month data for:', MONTHS[selectedDate.month], selectedDate.year);
    
    return allMonthlyData.find(month => {
      // The month format is "March 2023"
      const monthStr = `${MONTHS[selectedDate.month]} ${selectedDate.year}`;
      return month?.month === monthStr;
    }) || { expenses: [] };
  }, [allMonthlyData, selectedDate.month, selectedDate.year]);
  
  // Apply filters and sorting - memoized
  const filteredExpenses = useMemo(() => {
    console.log('Filtering expenses, count before:', currentMonthData.expenses?.length || 0);
    
    if (!Array.isArray(currentMonthData.expenses)) {
      console.warn('currentMonthData.expenses is not an array:', currentMonthData);
      return [];
    }
    
    // Apply search and category filters
    return currentMonthData.expenses.filter((expense: Expense) => {
      const matchesSearch = !searchQuery || 
        (expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (expense.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        
      const matchesCategories = selectedCategories.length === 0 || 
        (expense.category && selectedCategories.includes(expense.category));
        
      return matchesSearch && matchesCategories;
    }).sort((a: Expense, b: Expense) => {
      switch (sortBy) {
        case 'date':
          return sortOrder === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          const amountA = typeof a.amount === 'string' ? parseFloat(a.amount) : (a.amount || 0);
          const amountB = typeof b.amount === 'string' ? parseFloat(b.amount) : (b.amount || 0);
          return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
        case 'category':
          return sortOrder === 'asc' 
            ? (a.category || '').localeCompare(b.category || '')
            : (b.category || '').localeCompare(a.category || '');
        default:
          return 0;
      }
    });
  }, [currentMonthData.expenses, searchQuery, selectedCategories, sortBy, sortOrder]);
  
  // Group expenses by date for display - memoized with Web Worker
  const groupedExpenses = useMemo(() => {
    console.log('Grouping expenses by date, count:', filteredExpenses?.length || 0);
    
    if (!Array.isArray(filteredExpenses)) {
      return {};
    }

    // Fallback processing function that runs on main thread
    const processDataOnMainThread = () => {
      return filteredExpenses.reduce((acc, expense) => {
        if (!expense?.date) return acc;
        
        const dateKey = formatDateToUK(expense.date);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(expense);
        return acc;
      }, {} as Record<string, Expense[]>);
    };

    return processDataOnMainThread();
  }, [filteredExpenses]);
  
  // Helper functions (without useCallback)
  function showError(errorKey: string, message: string) {
    // Since error is a string, not an object, just set it directly
    setError(message);
    
    // Auto-clear error after 5 seconds
    if (errorTimeoutRef.current !== null) {
      window.clearTimeout(errorTimeoutRef.current);
    }
    
    errorTimeoutRef.current = window.setTimeout(() => {
      setError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  }
  
  // Load data function (without useCallback)
  async function loadData() {
    if (!mountedRef.current) return;
    
    console.log('Loading expenses data...');
    setLoading(true);
    setError(null);
    
    try {
      // Add date range filter to only load last 3 months by default
      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      
      const startDate = threeMonthsAgo.toISOString().split('T')[0];
      
      // Add timeout protection for the API call
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });
      
      // Race between the actual request and the timeout
      const result = await Promise.race([
        calculateUserBalances({
          startDate,
          limit: 200 // Reasonable limit to prevent loading too much data
        }),
        timeoutPromise
      ]) as any; // Type assertion needed due to race with timeout promise
      
      // Validate the result
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      console.log('Data loaded:', {
        monthCount: result.monthlyExpenses?.length || 0,
        months: result.monthlyExpenses?.map((m: any) => m.month) || []
      });
      
      if (mountedRef.current) {
        setAllMonthlyData(result.monthlyExpenses || []);
        
        // Extract all unique categories
        const categories = new Set<string>();
        result.monthlyExpenses?.forEach((month: any) => {
          if (month && Array.isArray(month.expenses)) {
            month.expenses.forEach((expense: any) => {
              if (isValidExpense(expense) && expense.category) {
                categories.add(expense.category);
              }
            });
          }
        });
        
        setAllCategories(Array.from(categories));
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error loading expenses:', err);
      if (mountedRef.current) {
        setError('Failed to load expenses. Please try again.');
        setLoading(false);
      }
    }
  }
  
  // Set up subscription (without useCallback)
  async function setupSubscription() {
    if (!mountedRef.current || subscriptionRef.current) return;
    
    // Get the current user as _user state
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Don't proceed if there's no user
    if (!currentUser) {
      console.log('Cannot set up subscription: _user not authenticated');
      return;
    }
    
    try {
      // Unsubscribe from any existing subscription first
      if (subscriptionRef.current) {
        console.log('Cleaning up existing subscription before creating a new one');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      console.log(`Setting up realtime subscription for _user ${currentUser.id}`);
      
      // Create a more specific channel with a unique channel name
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
            console.log('Expense change detected via subscription:', payload);
            if (!mountedRef.current) return;
            
            // Handle different event types
            if (payload.eventType === 'INSERT') {
              console.log('New expense created, refreshing data');
              loadData();
            } else if (payload.eventType === 'DELETE') {
              console.log('Expense deleted, refreshing data');
              loadData();
            } else if (payload.eventType === 'UPDATE') {
              console.log('Expense updated, refreshing data');
              loadData();
            }
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status: ${status}`);
        });
        
      console.log(`Subscription setup complete for channel ${channelName}`);
      
      // Keep reference to unsubscribe later
      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Failed to set up subscription:', error);
      // Try again after a short delay if we failed to set up the subscription
      if (mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current && !subscriptionRef.current) {
            console.log('Retrying subscription setup...');
            setupSubscription();
          }
        }, 5000);
      }
    }
  }
  
  // Handle delete without useCallback
  async function handleDelete(expenseId: string, _isPaidByCurrentUser: boolean) {
    if (!expenseId || !mountedRef.current) return;
    
    try {
      // Add confirmation
      if (!window.confirm('Are you sure you want to delete this expense?')) {
        return;
      }
      
      // Show loading state
      showError('delete', 'Deleting expense...');
      
      const result = await deleteExpense(expenseId);
      
      if (result.success && mountedRef.current) {
        console.log('Expense deleted successfully');
        showError('delete', 'Expense deleted successfully');
        
        // Explicitly reload data to ensure UI is updated
        await loadData().catch(err => {
          console.error('Error reloading data after delete:', err);
        });
      } else if (mountedRef.current) {
        console.error('Delete operation failed:', result);
        showError('delete', result.message || 'Failed to delete expense');
      }
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      if (mountedRef.current) {
        showError('delete', `Error deleting expense: ${err.message || 'Unknown error'}`);
      }
    }
  }
  
  // Navigation helpers (without useCallback)
  function handlePrevMonth() {
    setSelectedDate(prev => {
      let newMonth = prev.month - 1;
      let newYear = prev.year;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      
      return { month: newMonth, year: newYear };
    });
  }
  
  function handleNextMonth() {
    setSelectedDate(prev => {
      let newMonth = prev.month + 1;
      let newYear = prev.year;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      
      return { month: newMonth, year: newYear };
    });
  }
  
  // Toggle filter visibility (without useCallback)
  function toggleFilters() {
    setShowFilters(prev => !prev);
  }
  
  // Handle search input change (without useCallback)
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }
  
  // Handle category selection change (without useCallback)
  function handleCategoryChange(category: string) {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }
  
  // Handle sorting change (without useCallback)
  function handleSortChange(field: string) {
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
  }
  
  // Make the navigation handlers more robust (without useCallback)
  function handleEditClick(e: React.MouseEvent, expense: Expense) {
    if (!e || !expense) {
      console.error('Invalid edit click parameters:', { e, expense });
      return;
    }
    
    e.stopPropagation();
    
    if (!isValidExpense(expense)) {
      console.error('Invalid expense object:', expense);
      return;
    }
    
    if (navigate) {
      // Navigate directly to the expense page with a state parameter indicating edit mode
      // This avoids the UUID parsing error with the "edit" segment in the URL
      navigate(`/expenses/${expense.id}`, { state: { editMode: true } });
    }
  }
  
  function handleExpenseClick(expense: Expense) {
    if (!expense) {
      console.error('Invalid expense click parameter:', expense);
      return;
    }
    
    if (!isValidExpense(expense)) {
      console.error('Invalid expense object:', expense);
      return;
    }
    
    if (navigate) {
      navigate(`/expenses/${expense.id}`);
    }
  }
  
  // Effect for initial data loading
  useEffect(() => {
    console.log('Component mounted, setting up...');
    mountedRef.current = true;
    
    // Load initial data with error handling
    loadData().catch(err => {
      console.error('Initial data load error:', err);
      if (mountedRef.current) {
        setError(`Failed to load initial data: ${err.message || 'Unknown error'}`);
        setLoading(false);
      }
    });
    
    // Set up subscription with error handling
    let setupAttempted = false;
    const attemptSetup = async () => {
      if (setupAttempted) return;
      setupAttempted = true;
      
      try {
        await setupSubscription();
      } catch (err) {
        console.error('Error setting up subscription:', err);
        // Don't retry if we've already attempted once
      }
    };
    
    attemptSetup();
    
    return () => {
      console.log('Component unmounting, cleaning up...');
      mountedRef.current = false;
      
      // Clear any pending timeouts
      if (errorTimeoutRef.current !== null) {
        window.clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
      
      // Clean up subscription with error handling
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
          console.log('Unsubscribed successfully.');
        } catch (err) {
          console.error('Error unsubscribing:', err);
          // Not much we can do on unmount if this fails
        }
        subscriptionRef.current = null;
      }
    };
  }, []);
  
  // This effect runs whenever the refreshTrigger changes
  // This ensures that the component re-loads data when an expense is created or deleted elsewhere
  useEffect(() => {
    console.log('MonthlyExpenses: refreshTrigger changed, reloading data...', refreshTrigger);
    
    if (refreshTrigger > 0) {
      // Use a small delay to ensure other operations have completed
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          // Invalidate cache before loading to ensure fresh data
          try {
            // Directly use the imported function
            invalidateExpensesCache();
            console.log('Cache invalidated before reload');
          } catch (err) {
            console.warn('Failed to invalidate cache:', err);
          }
          
          loadData().catch(err => {
            console.error('Error reloading data after trigger:', err);
            if (mountedRef.current) {
              showError('refresh', 'Failed to refresh expenses data');
            }
          });
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [refreshTrigger]);
  
  // Helper for rendering the month title with navigation
  const renderMonthTitle = useMemo(() => (
    <div className="flex items-center justify-between mb-6">
      <button 
        onClick={handlePrevMonth}
        className="text-gray-400 hover:text-gray-600 p-2"
        aria-label="Previous month"
      >
        <ChevronLeft size={24} />
      </button>
      
      <h2 className="text-xl font-semibold">
        {MONTHS[selectedDate.month]} {selectedDate.year}
      </h2>
      
      <button 
        onClick={handleNextMonth}
        className="text-gray-400 hover:text-gray-600 p-2"
        aria-label="Next month"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  ), [selectedDate.month, selectedDate.year]);
  
  // Helper for rendering filters
  const renderFilters = useMemo(() => (
    <div className={`mb-6 ${showFilters ? 'block' : 'hidden'}`}>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Search
          </label>
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search expenses..."
              className="flex-grow p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="p-2 bg-gray-50">
              <Search size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {allCategories.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Sort By
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('date')}
              className={`text-xs px-3 py-1 rounded-md flex items-center ${
                sortBy === 'date'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date
              {sortBy === 'date' && (
                <ArrowUpDown size={12} className="ml-1" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('amount')}
              className={`text-xs px-3 py-1 rounded-md flex items-center ${
                sortBy === 'amount'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Amount
              {sortBy === 'amount' && (
                <ArrowUpDown size={12} className="ml-1" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('category')}
              className={`text-xs px-3 py-1 rounded-md flex items-center ${
                sortBy === 'category'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Category
              {sortBy === 'category' && (
                <ArrowUpDown size={12} className="ml-1" />
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
    sortBy
  ]);
  
  // Helper for rendering expenses or empty state
  const renderExpenses = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner message="Loading expenses..." />
        </div>
      );
    }
    
    if (!filteredExpenses || filteredExpenses.length === 0) {
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
    onNewExpense
  ]);
  
  return (
    <ErrorBoundary fallback={<div>Something went wrong with expenses</div>}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6">
        {renderMonthTitle}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-sm font-medium text-gray-600">
            {filteredExpenses?.length || 0} expense(s) this month
            {filteredExpenses?.length > 0 && (
              <span className="ml-2">
                • Total: <span className="font-semibold">{formatCurrency(sumExpenses(filteredExpenses))}</span>
              </span>
            )}
          </h3>
          
          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 text-sm"
          >
            <Filter size={14} />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
        
        {renderFilters}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            <div className="flex items-center">
              <div className="font-medium">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {renderExpenses}
        
        {onViewMore && filteredExpenses.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={onViewMore}
              className="text-blue-500 hover:text-blue-700 font-medium text-sm"
            >
              View all expenses
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MonthlyExpenses;