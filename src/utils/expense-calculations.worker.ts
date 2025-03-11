/* 
 * Web Worker for Expense Calculations
 * This worker handles computation-heavy tasks related to expense analysis
 * to prevent UI blocking.
 */

// Type definitions for messages between the worker and main thread
type WorkerRequest = {
  action: 'CALCULATE_MONTHLY_TOTALS' | 'CALCULATE_STATISTICS' | 'GROUP_BY_DATE' | 'PROCESS_ANALYTICS';
  payload: any;
};

type WorkerResponse = {
  action: string;
  result: any;
  error?: string;
};

// Listen for messages from the main thread
self.addEventListener('message', handleMessage);

// Handle incoming messages
function handleMessage(event: MessageEvent<WorkerRequest>): void {
  try {
    const { action, payload } = event.data;
    let result;

    switch (action) {
      case 'CALCULATE_MONTHLY_TOTALS':
        result = calculateMonthlyTotals(payload);
        break;
      
      case 'CALCULATE_STATISTICS':
        result = calculateStatistics(payload);
        break;
      
      case 'GROUP_BY_DATE':
        result = groupExpensesByDate(payload);
        break;
        
      case 'PROCESS_ANALYTICS':
        result = processAnalyticsData(payload);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Send the result back to the main thread
    self.postMessage({
      action,
      result
    });
  } catch (error) {
    // Handle any errors and send them back to the main thread
    self.postMessage({
      action: event.data.action,
      result: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Calculate monthly totals for expenses
function calculateMonthlyTotals(expenses: any[]): Record<string, number> {
  const monthlyTotals: Record<string, number> = {};

  expenses.forEach(expense => {
    if (!expense.date) return;

    const date = new Date(expense.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const amount = typeof expense.amount === 'string' 
      ? parseFloat(expense.amount) 
      : expense.amount;

    if (isNaN(amount)) return;

    monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + amount;
  });

  return monthlyTotals;
}

// Calculate various statistics for expenses
function calculateStatistics(expenses: any[]): {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
} {
  if (!expenses.length) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0,
      byCategory: {},
      byMonth: {}
    };
  }

  // Initialize variables for calculations
  let total = 0;
  let min = Number.MAX_VALUE;
  let max = 0;
  const byCategory: Record<string, number> = {};
  const byMonth: Record<string, number> = {};

  // Process each expense
  expenses.forEach(expense => {
    const amount = typeof expense.amount === 'string' 
      ? parseFloat(expense.amount) 
      : expense.amount;
    
    if (isNaN(amount)) return;

    // Update running calculations
    total += amount;
    min = Math.min(min, amount);
    max = Math.max(max, amount);

    // Aggregate by category
    const category = expense.category || 'Uncategorized';
    byCategory[category] = (byCategory[category] || 0) + amount;

    // Aggregate by month
    if (expense.date) {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      byMonth[monthYear] = (byMonth[monthYear] || 0) + amount;
    }
  });

  return {
    total,
    average: total / expenses.length,
    min: min === Number.MAX_VALUE ? 0 : min,
    max,
    count: expenses.length,
    byCategory,
    byMonth
  };
}

// Group expenses by date for display
function groupExpensesByDate(expenses: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};

  expenses.forEach(expense => {
    if (!expense.date) return;

    // Format the date as DD/MM/YYYY
    const date = new Date(expense.date);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateKey = `${day}/${month}/${year}`;

    // Initialize the array for this date if it doesn't exist yet
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }

    // Add the expense to the appropriate group
    groups[dateKey].push(expense);
  });

  return groups;
}

// Process analytics data for expenses
function processAnalyticsData(expenses: any[]): {
  categoryData: Array<{ category: string; amount: number }>;
  locationData: Array<{ location: string; amount: number }>;
  timeData: Array<{ period: string; amount: number }>;
  trendData: { daily: Array<{ date: string; amount: number }> };
  totalSpending: number;
  expenseCount: number;
} {
  if (!expenses || expenses.length === 0) {
    return {
      categoryData: [],
      locationData: [],
      timeData: [],
      trendData: {
        daily: []
      },
      totalSpending: 0,
      expenseCount: 0
    };
  }

  // Group expenses by category and calculate totals
  const categoryData: Record<string, number> = {};
  expenses.forEach(expense => {
    const category = expense.categories?.category || expense.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    if (!isNaN(amount)) {
      categoryData[category] += amount;
    }
  });

  // Convert to array format
  const categoryChartData = Object.keys(categoryData).map(category => ({
    category,
    amount: parseFloat(categoryData[category].toFixed(2))
  }));

  // Process data for location chart
  const locationData: Record<string, number> = {};
  expenses.forEach(expense => {
    const location = expense.locations?.location || expense.location || 'Unknown';
    if (!locationData[location]) {
      locationData[location] = 0;
    }
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    if (!isNaN(amount)) {
      locationData[location] += amount;
    }
  });

  // Convert to array format
  const locationChartData = Object.keys(locationData).map(location => ({
    location,
    amount: parseFloat(locationData[location].toFixed(2))
  }));

  // Process data for time chart (by month)
  const timeData: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!expense.date) return;
    
    const date = new Date(expense.date);
    const monthYear = date.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    });

    if (!timeData[monthYear]) {
      timeData[monthYear] = 0;
    }
    
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    if (!isNaN(amount)) {
      timeData[monthYear] += amount;
    }
  });

  // Convert to array and sort by date
  const timeChartData = Object.keys(timeData).map(monthYear => ({
    period: monthYear,
    amount: parseFloat(timeData[monthYear].toFixed(2))
  }));

  // Sort time data chronologically
  timeChartData.sort((a, b) => {
    const dateA = new Date(a.period);
    const dateB = new Date(b.period);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate daily spending trend
  const dailySpending: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!expense.date) return;
    
    const date = expense.date;
    if (!dailySpending[date]) {
      dailySpending[date] = 0;
    }
    
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    if (!isNaN(amount)) {
      dailySpending[date] += amount;
    }
  });

  // Create trend data array sorted by date
  const dailyTrendData = Object.keys(dailySpending).map(date => ({
    date,
    amount: parseFloat(dailySpending[date].toFixed(2))
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate total spending
  let totalSpending = 0;
  expenses.forEach(expense => {
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    if (!isNaN(amount)) {
      totalSpending += amount;
    }
  });

  return {
    categoryData: categoryChartData,
    locationData: locationChartData,
    timeData: timeChartData,
    trendData: {
      daily: dailyTrendData
    },
    totalSpending: parseFloat(totalSpending.toFixed(2)),
    expenseCount: expenses.length
  };
}

// Explicitly tell TypeScript this is a module to avoid the "cannot redeclare block-scoped variable" error
export {}; 