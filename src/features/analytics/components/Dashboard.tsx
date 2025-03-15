import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, TrendingUp, Calendar, Loader, DollarSign, MapPin, BarChart2 } from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { calculateUserBalances } from '../../settlements/api/settlement-operations';
import ExpenseStatistics from '../../expenses/components/ExpenseStatistics';
import { ErrorBoundary } from '../../shared/components';
import { 
  calculateBudgetStatus, 
  getTopSpendingCategories,
  getTopSpendingLocations
} from '../api/analyticsApi';
import { 
  CategoryData, 
  LocationData, 
  BudgetStatus
} from '../types';
import { formatAmount } from '../../../utils/currencyUtils';

import { Expense } from '../../../core/types/expenses';

interface MonthlyExpense {
  month: string;
  expenses: Array<Expense>;
  total: number;
  totalPaidByCurrentUser?: number;
  totalPaidByOtherUser?: number;
  netBalance?: number;
  equalSplitTotal?: number;
  noSplitTotal?: number;
}

interface DashboardProps {
  className?: string;
}

/**
 * Dashboard component - displays an overview of expense statistics and summary data
 */
function Dashboard({ className = '' }: DashboardProps) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyExpense[]>([]);
  const [totalUnsettled, setTotalUnsettled] = useState('0');
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [topCategories, setTopCategories] = useState<CategoryData[]>([]);
  const [topLocations, setTopLocations] = useState<LocationData[]>([]);
  
  // Load expense data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get data for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const startDate = sixMonthsAgo.toISOString().split('T')[0];
      
      // Get user balances with expenses
      const result = await calculateUserBalances({
        startDate,
        limit: 500
      });
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      setMonthlyData(result.monthlyExpenses || []);
      setTotalUnsettled(result.totalUnsettledAmount || '0');
      
      // Get budget status
      const budgetResponse = await calculateBudgetStatus();
      if (budgetResponse.success && budgetResponse.data) {
        setBudgetStatus(budgetResponse.data);
      }
      
      // Get top categories
      const categoriesResponse = await getTopSpendingCategories(3, 'month');
      if (categoriesResponse.success && categoriesResponse.data) {
        setTopCategories(categoriesResponse.data);
      }
      
      // Get top locations
      const locationsResponse = await getTopSpendingLocations(3, 'month');
      if (locationsResponse.success && locationsResponse.data) {
        setTopLocations(locationsResponse.data);
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load data on mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);
  
  const today = new Date();
  
  // Calculate recent activity count
  const recentActivityCount = monthlyData
    .flatMap(month => month.expenses)
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const daysAgo = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo < 7; // Activity from the last 7 days
    }).length;
  
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <Loader className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-red-50 text-red-700 p-4 rounded-lg ${className}`}>
        <h3 className="text-lg font-medium mb-2">Error loading dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Calculate the total balance across all months
  const totalBalance = monthlyData.reduce((sum, month) => {
    // If the month has a netBalance property, use it
    if ('netBalance' in month) {
      return sum + (month.netBalance || 0);
    }
    return sum;
  }, 0);
  
  // Using formatAmount directly from currencyUtils
  return (
    <ErrorBoundary fallback={<div>Something went wrong loading the dashboard</div>}>
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            {today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Balance */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
              <div className={`p-2 rounded-md ${
                totalBalance > 0 ? 'bg-green-50 text-green-500' : 
                totalBalance < 0 ? 'bg-red-50 text-red-500' : 
                'bg-gray-50 text-gray-500'
              }`}>
                <CreditCard size={18} />
              </div>
            </div>
            <div className={`text-xl font-bold ${
              totalBalance > 0 ? 'text-green-600' : 
              totalBalance < 0 ? 'text-red-600' : 
              'text-gray-700'
            }`}>
              {formatAmount(Math.abs(totalBalance))}
              {totalBalance !== 0 && (
                <span className="text-sm font-normal ml-1">
                  {totalBalance > 0 ? '(you are owed)' : '(you owe)'}
                </span>
              )}
            </div>
          </div>
          
          {/* Total Unsettled */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500">Unsettled Amount</h3>
              <div className="p-2 bg-blue-50 text-blue-500 rounded-md">
                <Calendar size={18} />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-700">
              {formatAmount(totalUnsettled)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Pending settlements
            </div>
          </div>
          
          {/* Budget Status */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500">Budget Status</h3>
              <div className={`p-2 rounded-md ${
                !budgetStatus ? 'bg-gray-50 text-gray-500' :
                budgetStatus.status === 'on_track' ? 'bg-green-50 text-green-500' :
                budgetStatus.status === 'warning' ? 'bg-amber-50 text-amber-500' :
                'bg-red-50 text-red-500'
              }`}>
                <DollarSign size={18} />
              </div>
            </div>
            {budgetStatus ? (
              <>
                <div className="text-xl font-bold text-gray-700">
                  {formatAmount(budgetStatus.current)} / {formatAmount(budgetStatus.target)}
                </div>
                <div className="text-xs mt-1 flex items-center">
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    budgetStatus.status === 'on_track' ? 'bg-green-100 text-green-800' :
                    budgetStatus.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {budgetStatus.status === 'on_track' ? 'On Track' :
                     budgetStatus.status === 'warning' ? 'Warning' : 'At Risk'}
                  </div>
                  <span className="ml-1 text-gray-500">
                    {Math.round((budgetStatus.current / budgetStatus.target) * 100)}% of monthly budget
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xl font-bold text-gray-700">Not set</div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
              <div className="p-2 bg-purple-50 text-purple-500 rounded-md">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-700">
              {recentActivityCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              New expenses in the last 7 days
            </div>
          </div>
        </div>
        
        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Categories */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <BarChart2 size={16} className="mr-2 text-rose-500" />
              Top Spending Categories
            </h3>
            
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        index === 0 ? 'bg-rose-500' :
                        index === 1 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{category.category}</span>
                    </div>
                    <span className="text-sm font-medium">{formatAmount(category.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">No category data available</div>
            )}
          </div>
          
          {/* Top Locations */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
              <MapPin size={16} className="mr-2 text-rose-500" />
              Top Spending Locations
            </h3>
            
            {topLocations.length > 0 ? (
              <div className="space-y-3">
                {topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        index === 0 ? 'bg-rose-500' :
                        index === 1 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{location.location}</span>
                    </div>
                    <span className="text-sm font-medium">{formatAmount(location.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-2">No location data available</div>
            )}
          </div>
        </div>
        
        {/* Statistics Section */}
        <ExpenseStatistics 
          monthlyData={monthlyData} 
          formatCurrency={formatAmount} 
          className="mt-6"
        />
      </div>
    </ErrorBoundary>
  );
}

export default Dashboard;