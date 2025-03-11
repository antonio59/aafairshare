import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, ChevronDown, BarChart2, _PieChart, TrendingUp, _Download, _MapPin, ChevronLeft, ChevronRight, _Clock,
  DollarSign, Target, _AlertTriangle, Calendar as _CalendarIcon, _ArrowUpRight, _ArrowDownRight, Activity, Settings,
  FileSpreadsheet, FileText
} from 'lucide-react';
import { getExpenseAnalytics } from '../../expenses/api/expenseApi';
import { getUserBudget, saveBudgetSettings } from '../api/budgetApi';
import { useCurrency } from '../../../core/contexts/CurrencyContext';
import { useAuth } from '../../../core/contexts/AuthContext';
import { _ErrorBoundary, _LoadingSpinner, _StatusMessage } from '../../shared/components';
import { _useErrorHandler } from '../../shared/hooks/useErrorHandler';
import { formatDateToUK } from '../../shared/utils/date-utils';
import { _formatDecimal } from '../../../utils/number-utils';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { ExpenseTrendChart } from './ExpenseTrendChart';
import { LocationSpendingChart } from './LocationSpendingChart';
import { BudgetSettingsModal } from './BudgetSettingsModal';

// Define interfaces for the component's state
interface CategoryData {
  category: string;
  amount: number;
}

interface LocationData {
  location: string;
  amount: number;
}

interface TimeData {
  period: string;
  amount: number;
}

interface DailyTrendData {
  date: string;
  amount: number;
}

interface TrendData {
  daily: DailyTrendData[];
}

interface BudgetStatus {
  current: number;
  target: number;
  status: 'on_track' | 'warning' | 'at_risk';
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { formatAmount, _currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // month, quarter, year, custom
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [trendData, setTrendData] = useState<TrendData>({ daily: [] });
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [customDateType, setCustomDateType] = useState('month'); // 'month' or 'quarter'
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [spendingVelocity, setSpendingVelocity] = useState(0);
  const [projectedSpending, setProjectedSpending] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus>({
    current: 0,
    target: 2000,
    status: 'on_track'
  });
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDateRangeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Calculate date ranges
        let endDate = new Date();
        let startDate = new Date(); // Default initialization
        
        console.log('Original date range selection:', { 
          dateRange, 
          customDateType, 
          selectedMonth, 
          selectedYear 
        });
        
        if (dateRange === 'custom') {
          if (customDateType === 'month') {
            // For specific month - set start date to first day of month
            startDate = new Date(selectedYear, selectedMonth, 1);
            // Set end date to last day of month (using 0th day of next month)
            endDate = new Date(selectedYear, selectedMonth + 1, 0);
            
            console.log('Custom month selection:', {
              month: selectedMonth,
              year: selectedYear,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0],
              fullStartDate: startDate.toISOString(),
              fullEndDate: endDate.toISOString()
            });
            
            // Reset the time to ensure full day coverage
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
          } else if (customDateType === 'quarter') {
            // For specific quarter
            const quarterStartMonth = (selectedQuarter - 1) * 3;
            startDate = new Date(selectedYear, quarterStartMonth, 1);
            endDate = new Date(selectedYear, quarterStartMonth + 3, 0);
            
            // Reset the time to ensure full day coverage
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
          }
        } else {
          // Default ranges (last month, last quarter, last year)
          switch (dateRange) {
            case 'quarter':
              // Last quarter
              const currentMonth = endDate.getMonth();
              const currentQuarter = Math.floor(currentMonth / 3);
              const lastQuarterEndMonth = currentQuarter * 3 - 1;
              
              if (lastQuarterEndMonth < 0) {
                // Handle previous year's quarter
                startDate = new Date(endDate.getFullYear() - 1, 9, 1); // Oct 1
                endDate = new Date(endDate.getFullYear() - 1, 11, 31); // Dec 31
              } else {
                const lastQuarterStartMonth = lastQuarterEndMonth - 2;
                startDate = new Date(endDate.getFullYear(), lastQuarterStartMonth, 1);
                endDate = new Date(endDate.getFullYear(), lastQuarterEndMonth + 1, 0);
              }
              break;
              
            case 'year':
              // Last year - Jan 1 to Dec 31 of previous year
              startDate = new Date(endDate.getFullYear() - 1, 0, 1);
              endDate = new Date(endDate.getFullYear() - 1, 11, 31);
              break;
              
            case 'month':
            default:
              // Last month - 1st to last day of previous month
              const prevMonth = endDate.getMonth() - 1;
              const yearOfPrevMonth = prevMonth < 0 ? endDate.getFullYear() - 1 : endDate.getFullYear();
              const monthIndex = prevMonth < 0 ? 11 : prevMonth;
              
              startDate = new Date(yearOfPrevMonth, monthIndex, 1);
              endDate = new Date(yearOfPrevMonth, monthIndex + 1, 0);
              break;
          }
          
          // Reset the time to ensure full day coverage
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        }
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        console.log('Calculated date range for analytics:', { 
          formattedStartDate, 
          formattedEndDate,
          startDateObject: startDate.toISOString(),
          endDateObject: endDate.toISOString()
        });
        
        let analyticsData;
        try {
          // Fetch analytics data
          analyticsData = await getExpenseAnalytics(formattedStartDate, formattedEndDate);
          console.log('Analytics data received:', analyticsData);
        } catch (analyticsError) {
          console.error('Error fetching analytics data:', analyticsError);
          setError('Failed to load analytics data. Please try again.');
          setLoading(false);
          return;
        }

        // Ensure numeric values for calculations
        const ensureNumber = (value: any) => {
          if (typeof value === 'string') {
            return parseFloat(value) || 0;
          }
          return typeof value === 'number' ? value : 0;
        };
        
        // Make sure we have properly formatted data
        const normalizedAnalyticsData = {
          ...analyticsData,
          categoryData: (analyticsData.categoryData || []).map((cat: any) => ({
            ...cat,
            amount: ensureNumber(cat.amount)
          })),
          locationData: (analyticsData.locationData || []).map((loc: any) => ({
            ...loc,
            amount: ensureNumber(loc.amount)
          })), _timeData: (analyticsData._timeData || []).map((time: any) => ({
            ...time,
            amount: ensureNumber(time.amount)
          })),
          trendData: {
            daily: (((analyticsData.trendData || {}) as any).daily || []).map((day: any) => ({
              ...day,
              amount: ensureNumber(day.amount)
            }))
          },
          totalSpending: ensureNumber(analyticsData.totalSpending)
        };
        
        setCategoryData(normalizedAnalyticsData.categoryData);
        setLocationData(normalizedAnalyticsData.locationData);
        setTimeData(normalizedAnalyticsData._timeData);
        setTrendData(normalizedAnalyticsData.trendData as TrendData);

        // Fetch user's budget settings - specifically for the current user
        let budgetSettings;
        try {
          // We specify the current user's ID to get their specific budget
          budgetSettings = await getUserBudget(user.id);
        } catch (budgetError) {
          console.warn('Error loading budget settings, using defaults:', budgetError);
          budgetSettings = {
            id: 'default',
            user_id: user?.id || 'default',
            monthly_target: 2000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          // Don't set error for budget issues - just use default and continue
        }
        
        // Calculate spending velocity (amount per day)
        const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        
        // Calculate weekly average (amount per week)
        const weeksInPeriod = daysInPeriod / 7;
        const weeklyAverage = normalizedAnalyticsData.totalSpending / weeksInPeriod;
        setSpendingVelocity(weeklyAverage);

        // Calculate projected spending for current month
        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
        const projected = calculateProjectedSpending(normalizedAnalyticsData.totalSpending, daysInPeriod, daysInMonth);
        setProjectedSpending(projected);

        // Update budget status with user's actual budget target
        const budgetTarget = ensureNumber(budgetSettings?.monthly_target) || 2000;
        const budgetProgress = (normalizedAnalyticsData.totalSpending / budgetTarget) * 100;
        setBudgetStatus(prev => ({
          ...prev,
          current: normalizedAnalyticsData.totalSpending,
          target: budgetTarget,
          status: budgetProgress > 90 ? 'at_risk' : budgetProgress > 75 ? 'warning' : 'on_track'
        }));
      } catch (error) {
        console.error('Error loading analytics:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalytics();
  }, [user, dateRange, customDateType, selectedMonth, selectedYear, selectedQuarter]);
  
  // Calculate totals
  const totalSpending = categoryData.reduce((total, item) => total + item.amount, 0);
  
  // Sort categories by amount
  const _sortedCategories = [...categoryData].sort((a, b) => b.amount - a.amount);
  
  // Sort locations by amount
  const _sortedLocations = [...locationData].sort((a, b) => b.amount - a.amount);
  
  // Format month labels
  const _formatMonth = (monthStr: string): string => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const handleDateRangeChange = (newRange: string): void => {
    setDateRange(newRange);
    if (newRange !== 'custom') {
      setShowDateRangeDropdown(false);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next'): void => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        newMonth = 11;
        newYear = selectedYear - 1;
      } else {
        newMonth = selectedMonth - 1;
      }
    } else {
      if (selectedMonth === 11) {
        newMonth = 0;
        newYear = selectedYear + 1;
      } else {
        newMonth = selectedMonth + 1;
      }
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleQuarterChange = (direction: 'prev' | 'next'): void => {
    let newQuarter = selectedQuarter;
    let newYear = selectedYear;
    
    if (direction === 'prev') {
      if (selectedQuarter === 1) {
        newQuarter = 4;
        newYear = selectedYear - 1;
      } else {
        newQuarter = selectedQuarter - 1;
      }
    } else {
      if (selectedQuarter === 4) {
        newQuarter = 1;
        newYear = selectedYear + 1;
      } else {
        newQuarter = selectedQuarter + 1;
      }
    }
    
    setSelectedQuarter(newQuarter);
    setSelectedYear(newYear);
  };

  const handleYearChange = (direction: 'prev' | 'next'): void => {
    setSelectedYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  const getQuarterName = (quarter: number): string => {
    return `Q${quarter}`;
  };

  const getDateRangeDisplayText = (): string => {
    if (dateRange === 'custom') {
      if (customDateType === 'month') {
        return `${getMonthName(selectedMonth)} ${selectedYear}`;
      } else {
        return `${getQuarterName(selectedQuarter)} ${selectedYear}`;
      }
    } else {
      if (dateRange === 'month') return 'Last Month';
      if (dateRange === 'quarter') return 'Last Quarter';
      if (dateRange === 'year') return 'Last Year';
      return '';
    }
  };

  const handleExport = async (format: 'pdf' | 'csv'): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      // Generate unique filename
      const filename = `expense_report_${Date.now()}.${format}`;
      
      if (format === 'csv') {
        // Create CSV content
        const csvContent = [
          ['AaFairShare Expense Report'],
          ['Date Range:', getDateRangeDisplayText()],
          ['Total Spending:', formatAmount(totalSpending)],
          [''],
          ['Category', 'Amount', 'Percentage'],
          ...categoryData.map(cat => [
            cat.category,
            formatAmount(cat.amount),
            `${((cat.amount / totalSpending) * 100).toFixed(1)}%`
          ]),
          [''],
          ['Location', 'Amount', 'Percentage'],
          ...locationData.map(loc => [
            loc.location,
            formatAmount(loc.amount),
            `${((loc.amount / totalSpending) * 100).toFixed(1)}%`
          ])
        ];
        
        // Convert to CSV string
        const csvString = csvContent.map(row => row.join(',')).join('\n');
        
        // Create download link
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary link for download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      else if (format === 'pdf') {
        // For PDF would integrate with PDF generation library
        alert('PDF export functionality is not yet implemented');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add new helper functions
  const _calculateDailyAverage = (expenses: number, days: number): number => {
    return expenses / (days || 1);
  };

  const calculateProjectedSpending = (currentSpending: number, daysInPeriod: number, totalDays: number): number => {
    return (currentSpending / daysInPeriod) * totalDays;
  };

  const handleSaveBudget = async (budgetAmount: number): Promise<void> => {
    try {
      // We're using the open policy, so this will save the budget for the current user
      await saveBudgetSettings({ monthly_target: budgetAmount });
      
      // Update local budget state
      setBudgetStatus(prev => ({
        ...prev,
        target: budgetAmount,
        status: (prev.current / budgetAmount) * 100 > 90 
          ? 'at_risk' 
          : (prev.current / budgetAmount) * 100 > 75 
            ? 'warning' 
            : 'on_track'
      }));
      
    } catch (error) {
      console.error('Error saving budget:', error);
      throw error;
    }
  };

  // Add current month option to date range display
  const getCurrentMonthOption = (): React.ReactElement => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Calculate first and last day of current month
    const _firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    return (
      <button 
        onClick={() => {
          // Important: Call loadAnalytics directly with the specific date range
          // instead of relying on state updates which might not be reflected immediately
          const startDate = new Date(currentYear, currentMonth, 1);
          const endDate = new Date(currentYear, currentMonth + 1, 0);
          
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          
          // Update state
          setDateRange('custom');
          setCustomDateType('month');
          setSelectedMonth(currentMonth);
          setSelectedYear(currentYear);
          setShowDateRangeDropdown(false);
          
          // Log the dates for debugging
          console.log('Current month selection - immediate load:', {
            month: currentMonth,
            year: currentYear,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            formattedStartDate: startDate.toISOString().split('T')[0],
            formattedEndDate: endDate.toISOString().split('T')[0]
          });
          
          // Force an immediate load with these specific dates
          setLoading(true);
          getExpenseAnalytics(
            startDate.toISOString().split('T')[0], 
            endDate.toISOString().split('T')[0]
          ).then(data => {
            console.log('Direct load analytics data:', data);
            
            // Process data immediately to avoid state update delays
            const ensureNumber = (value: any) => {
              if (typeof value === 'string') {
                return parseFloat(value) || 0;
              }
              return typeof value === 'number' ? value : 0;
            };
            
            // Make sure we have properly formatted data
            const normalizedData = {
              ...data,
              categoryData: (data.categoryData || []).map((cat: any) => ({
                ...cat,
                amount: ensureNumber(cat.amount)
              })),
              locationData: (data.locationData || []).map((loc: any) => ({
                ...loc,
                amount: ensureNumber(loc.amount)
              })), _timeData: (data._timeData || []).map((time: any) => ({
                ...time,
                amount: ensureNumber(time.amount)
              })),
              trendData: {
                daily: (((data.trendData || {}) as any).daily || []).map((day: any) => ({
                  ...day,
                  amount: ensureNumber(day.amount)
                }))
              },
              totalSpending: ensureNumber(data.totalSpending)
            };
            
            // Update component state with normalized data
            setCategoryData(normalizedData.categoryData);
            setLocationData(normalizedData.locationData);
            setTimeData(normalizedData._timeData);
            setTrendData(normalizedData.trendData as TrendData);
            
            // Update spending metrics
            const days = lastDayOfMonth.getDate(); // number of days in month
            const weeksInPeriod = days / 7;
            const weeklyAverage = normalizedData.totalSpending / weeksInPeriod;
            setSpendingVelocity(weeklyAverage);
            
            // Get budget
            getUserBudget(user?.id).then(budgetSettings => {
              const budgetTarget = ensureNumber(budgetSettings?.monthly_target) || 2000;
              const budgetProgress = (normalizedData.totalSpending / budgetTarget) * 100;
              
              setBudgetStatus(prev => ({
                ...prev,
                current: normalizedData.totalSpending,
                target: budgetTarget,
                status: budgetProgress > 90 ? 'at_risk' : budgetProgress > 75 ? 'warning' : 'on_track'
              }));
              
              setLoading(false);
            }).catch(err => {
              console.warn('Error loading budget settings', err);
              setLoading(false);
            });
          }).catch(err => {
            console.error('Direct load analytics error:', err);
            setError('Failed to load analytics data. Please try again.');
            setLoading(false);
          });
        }}
        className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md ${
          dateRange === 'custom' && 
          customDateType === 'month' && 
          selectedMonth === currentMonth && 
          selectedYear === currentYear
            ? 'bg-rose-100 text-rose-700 font-medium' 
            : 'hover:bg-gray-100'
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
        Current Month
      </button>
    );
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <div className="py-8">
          <div className="bg-gray-100 inline-flex p-4 mb-4 rounded-full">
            <BarChart2 size={24} className="text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sign in to view analytics</h3>
          <p className="text-gray-600 mb-4">Track spending patterns and insights into your expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Expense Analytics</h2>
          
          <div className="flex items-center space-x-3">
            {/* Export buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={() => handleExport('pdf')} 
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                <FileText className="w-4 h-4 mr-1 text-rose-500" />
                PDF
              </button>
              <button 
                onClick={() => handleExport('csv')} 
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1 text-rose-500" />
                CSV
              </button>
            </div>
            
            <div className="relative inline-block">
              <button 
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium rounded-md transition-colors border border-rose-200"
                onClick={() => setShowDateRangeDropdown(prev => !prev)}
              >
                <Calendar size={16} />
                <span>{getDateRangeDisplayText()}</span>
                <ChevronDown size={14} className={`transition-transform ${showDateRangeDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDateRangeDropdown && (
                <div ref={dropdownRef} className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Preset Ranges</h4>
                    <div className="space-y-1.5">
                      {getCurrentMonthOption()}
                      <button 
                        onClick={() => handleDateRangeChange('month')}
                        className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'month' ? 'bg-rose-100 text-rose-700 font-medium' : 'hover:bg-gray-100'}`}
                      >
                        <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                        Last Month
                      </button>
                      <button 
                        onClick={() => handleDateRangeChange('quarter')}
                        className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'quarter' ? 'bg-rose-100 text-rose-700 font-medium' : 'hover:bg-gray-100'}`}
                      >
                        <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                        Last Quarter
                      </button>
                      <button 
                        onClick={() => handleDateRangeChange('year')}
                        className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'year' ? 'bg-rose-100 text-rose-700 font-medium' : 'hover:bg-gray-100'}`}
                      >
                        <span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>
                        Last Year
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Custom Range</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center bg-white rounded-md p-1 border border-gray-200">
                        <button 
                          onClick={() => {
                            setCustomDateType('month');
                            handleDateRangeChange('custom');
                          }}
                          className={`flex-1 text-center py-2 text-sm rounded-md ${customDateType === 'month' && dateRange === 'custom' ? 'bg-rose-100 text-rose-700 font-medium' : 'hover:bg-gray-100'}`}
                        >
                          Month
                        </button>
                        <button 
                          onClick={() => {
                            setCustomDateType('quarter');
                            handleDateRangeChange('custom');
                          }}
                          className={`flex-1 text-center py-2 text-sm rounded-md ${customDateType === 'quarter' && dateRange === 'custom' ? 'bg-rose-100 text-rose-700 font-medium' : 'hover:bg-gray-100'}`}
                        >
                          Quarter
                        </button>
                      </div>
                      
                      {dateRange === 'custom' && customDateType === 'month' && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between bg-rose-50 p-2 border-b border-gray-200">
                            <button 
                              onClick={() => handleYearChange('prev')} 
                              className="p-1 hover:bg-rose-100 rounded-full"
                            >
                              <ChevronLeft size={14} className="text-rose-600" />
                            </button>
                            <div className="text-center font-medium text-rose-700">{selectedYear}</div>
                            <button 
                              onClick={() => handleYearChange('next')} 
                              className="p-1 hover:bg-rose-100 rounded-full"
                            >
                              <ChevronRight size={14} className="text-rose-600" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-3">
                            <button 
                              onClick={() => handleMonthChange('prev')} 
                              className="p-1.5 hover:bg-gray-100 rounded-full"
                            >
                              <ChevronLeft size={16} className="text-gray-600" />
                            </button>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-800">{getMonthName(selectedMonth)}</div>
                            </div>
                            <button 
                              onClick={() => handleMonthChange('next')} 
                              className="p-1.5 hover:bg-gray-100 rounded-full"
                            >
                              <ChevronRight size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {dateRange === 'custom' && customDateType === 'quarter' && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between bg-rose-50 p-2 border-b border-gray-200">
                            <button 
                              onClick={() => handleYearChange('prev')} 
                              className="p-1 hover:bg-rose-100 rounded-full"
                            >
                              <ChevronLeft size={14} className="text-rose-600" />
                            </button>
                            <div className="text-center font-medium text-rose-700">{selectedYear}</div>
                            <button 
                              onClick={() => handleYearChange('next')} 
                              className="p-1 hover:bg-rose-100 rounded-full"
                            >
                              <ChevronRight size={14} className="text-rose-600" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-3">
                            <button 
                              onClick={() => handleQuarterChange('prev')} 
                              className="p-1.5 hover:bg-gray-100 rounded-full"
                            >
                              <ChevronLeft size={16} className="text-gray-600" />
                            </button>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-gray-800">Quarter {selectedQuarter}</div>
                            </div>
                            <button 
                              onClick={() => handleQuarterChange('next')} 
                              className="p-1.5 hover:bg-gray-100 rounded-full"
                            >
                              <ChevronRight size={16} className="text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {dateRange === 'custom' && (
                        <button
                          onClick={() => setShowDateRangeDropdown(false)}
                          className="w-full mt-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center"
                        >
                          <span>Apply Filter</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ) : categoryData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-gray-100 inline-flex p-4 mb-4 rounded-full">
              <BarChart2 size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No expense data yet</h3>
            <p className="text-gray-500 mb-4">As you add expenses, you'll see analytics and insights here.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Monthly Spending Overview */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Activity size={18} className="mr-2 text-rose-500" /> 
                  Monthly Overview
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Total Spending</p>
                    <DollarSign size={16} className="text-rose-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mt-2">{formatAmount(totalSpending)}</p>
                  <p className="text-xs text-gray-500 mt-1">This period</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Weekly Average</p>
                    <TrendingUp size={16} className="text-rose-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mt-2">
                    {formatAmount(spendingVelocity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per week</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Projected</p>
                    <Target size={16} className="text-rose-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mt-2">
                    {formatAmount(projectedSpending)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Enhanced Category Distribution Chart */}
              <CategoryDistributionChart 
                categories={categoryData}
                formatAmount={formatAmount}
              />
              
              {/* Enhanced Location Chart */}
              <LocationSpendingChart 
                locations={locationData}
                formatAmount={formatAmount}
              />
            </div>
            
            {/* Enhanced Trend Chart */}
            <div className="mb-6">
              <ExpenseTrendChart 
                trendData={trendData.daily || []}
                formatAmount={formatAmount}
                title="Monthly Spending Trends"
              />
            </div>

            {/* Budget Status Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Target className="mr-2 h-5 w-5 text-rose-500" /> 
                  Monthly Budget
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                    budgetStatus.status === 'on_track' 
                      ? 'bg-green-100 text-green-800' 
                      : budgetStatus.status === 'warning' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {budgetStatus.status === 'on_track' 
                      ? 'On Track' 
                      : budgetStatus.status === 'warning' 
                        ? 'Warning' 
                        : 'At Risk'}
                  </div>
                  <button 
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Edit budget settings"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold inline-block text-rose-600">
                      {Math.round((budgetStatus.current / budgetStatus.target) * 100)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-rose-600">
                      {formatAmount(budgetStatus.current)} / {formatAmount(budgetStatus.target)}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-rose-200">
                  <div 
                    style={{ width: `${Math.min(100, (budgetStatus.current / budgetStatus.target) * 100)}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      budgetStatus.status === 'on_track' 
                        ? 'bg-green-500' 
                        : budgetStatus.status === 'warning' 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                    }`}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Start: {formatDateToUK(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())}</span>
                  <span>End: {formatDateToUK(new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={budgetStatus.target}
        onSave={handleSaveBudget}
      />
    </div>
  );
}