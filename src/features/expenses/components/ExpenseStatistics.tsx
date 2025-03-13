import React, { useMemo } from 'react';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar
} from 'lucide-react';
import { MONTHS } from '../../shared/utils/date-utils';

// Make the component more flexible with generic types
interface GenericMonthlyData {
  month: string;
  expenses: Array<{
    id: string;
    date: string;
    amount: number | string;
    _category?: string;
    category_id?: string;
    [key: string]: any;
  }>;
  total: number;
  [key: string]: any;
}

interface ExpenseStatisticsProps {
  monthlyData: GenericMonthlyData[];
  formatCurrency: (amount: number | string) => string;
  period?: 'month' | 'year';
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
}

/**
 * A card displaying a single statistic
 */
const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  percentage 
}: StatCardProps) => {
  // Define trend color
  const trendColor = trend === 'up' 
    ? 'text-red-500' 
    : trend === 'down' 
      ? 'text-green-500' 
      : 'text-gray-500';
      
  // Define trend icon
  const trendIcon = trend === 'up' 
    ? <TrendingUp size={14} className="inline mr-1" /> 
    : trend === 'down' 
      ? <TrendingDown size={14} className="inline mr-1" /> 
      : null;
      
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-blue-50 text-blue-500 rounded-md">
          {icon}
        </div>
      </div>
      
      <div className="mb-1">
        <div className="text-xl font-bold">{value}</div>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
      
      {(trend && percentage !== undefined) && (
        <div className={`text-xs ${trendColor} flex items-center mt-2`}>
          {trendIcon}
          <span className="font-medium">{percentage}%</span>
          <span className="ml-1">from previous period</span>
        </div>
      )}
    </div>
  );
};

/**
 * A component that displays expense statistics and trends
 */
function ExpenseStatistics({ monthlyData, formatCurrency, period = 'month', className = '' }: ExpenseStatisticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!monthlyData || !monthlyData.length) {
      return {
        totalSpent: 0,
        averagePerMonth: 0,
        mostExpensiveMonth: { month: '', amount: 0 },
        leastExpensiveMonth: { month: '', amount: 0 },
        currentMonth: { month: '', amount: 0 },
        previousMonth: { month: '', amount: 0 },
        percentageChange: 0,
        trend: 'neutral' as const,
        mostCommonCategory: { name: '', count: 0 },
        totalTransactions: 0
      };
    }
    
    // Sort data chronologically
    const sortedData = [...monthlyData].sort((a, b) => {
      const [aMonthName, aYear] = a.month.split(' ');
      const [bMonthName, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      // Find month indices safely
      const aMonthIndex = MONTHS.findIndex(m => m === aMonthName);
      const bMonthIndex = MONTHS.findIndex(m => m === bMonthName);
      
      return aMonthIndex - bMonthIndex;
    });
    
    // Current and previous month
    const currentMonth = sortedData[sortedData.length - 1];
    const previousMonth = sortedData.length > 1 ? sortedData[sortedData.length - 2] : null;
    
    // Calculate total spent
    const totalSpent = sortedData.reduce((sum, month) => sum + month.total, 0);
    
    // Calculate average per month
    const averagePerMonth = sortedData.length > 0 ? totalSpent / sortedData.length : 0;
    
    // Find most and least expensive months
    const mostExpensiveMonth = sortedData.reduce(
      (max, month) => (month.total > max.amount ? { month: month.month, amount: month.total } : max),
      { month: '', amount: 0 }
    );
    
    const leastExpensiveMonth = sortedData.reduce(
      (min, month) => (
        month.total > 0 && (min.amount === 0 || month.total < min.amount) 
          ? { month: month.month, amount: month.total } 
          : min
      ),
      { month: '', amount: 0 }
    );
    
    // Calculate percentage change from previous month
    const percentageChange = previousMonth && previousMonth.total > 0
      ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
      : 0;
    
    // Determine trend
    const trend = percentageChange > 0 
      ? 'up' as const
      : percentageChange < 0 
        ? 'down' as const
        : 'neutral' as const;
        
    // Find most common category
    const categoryCount: Record<string, number> = {};
    let totalTransactions = 0;
    
    sortedData.forEach(month => {
      if (Array.isArray(month.expenses)) {
        totalTransactions += month.expenses.length;
        
        month.expenses.forEach(expense => {
          if (expense._category) {
            categoryCount[expense._category] = (categoryCount[expense._category] || 0) + 1;
          } else if (expense.category_id) {
            // Fallback to category_id if _category is not available
            categoryCount[expense.category_id] = (categoryCount[expense.category_id] || 0) + 1;
          }
        });
      }
    });
    
    // Get category with highest count
    let mostCommonCategory = { name: '', count: 0 };
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > mostCommonCategory.count) {
        mostCommonCategory = { name: category, count };
      }
    });
    
    return {
      totalSpent,
      averagePerMonth,
      mostExpensiveMonth,
      leastExpensiveMonth,
      currentMonth: { month: currentMonth.month, amount: currentMonth.total },
      previousMonth: previousMonth ? { month: previousMonth.month, amount: previousMonth.total } : { month: '', amount: 0 },
      percentageChange: Math.abs(Math.round(percentageChange * 10) / 10),
      trend,
      mostCommonCategory,
      totalTransactions
    };
  }, [monthlyData]);
  
  // Handle empty state
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className={`bg-white p-4 rounded-lg shadow text-center ${className}`}>
        <BarChart className="mx-auto h-12 w-12 text-gray-300 mb-2" />
        <h3 className="text-lg font-medium text-gray-800 mb-1">No expense data available</h3>
        <p className="text-sm text-gray-500">Start tracking your expenses to see statistics</p>
      </div>
    );
  }
  
  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-semibold mb-4">Expense Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          description={period === 'month' ? 'Last 3 months' : 'Year to date'}
          icon={<DollarSign size={18} />}
        />
        
        {/* Monthly Average */}
        <StatCard
          title="Monthly Average"
          value={formatCurrency(stats.averagePerMonth)}
          icon={<BarChart size={18} />}
        />
        
        {/* Current Month */}
        <StatCard
          title="Current Month"
          value={formatCurrency(stats.currentMonth.amount)}
          description={stats.currentMonth.month}
          icon={<Calendar size={18} />}
          trend={stats.trend}
          percentage={stats.percentageChange}
        />
        
        {/* Total Transactions */}
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions.toString()}
          description={stats.mostCommonCategory.name ? `Most common: ${stats.mostCommonCategory.name}` : undefined}
          icon={<LineChart size={18} />}
        />
      </div>
      
      {/* Additional statistics could be added here in the future */}
    </div>
  );
}

export default ExpenseStatistics; 