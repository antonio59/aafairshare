import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, ChevronDown, BarChart2, TrendingUp, ChevronLeft, ChevronRight,
  DollarSign, Target, Activity, Settings,
  FileSpreadsheet, FileText
} from 'lucide-react';
import { 
  fetchExpenseAnalytics, 
  calculateBudgetStatus
} from '../api/analyticsApi';
import { getUserBudget, saveBudgetSettings } from '../api/budgetApi';
import { formatAmount, formatCurrency } from '../../../utils/currencyUtils';
import { useAuth } from '../../../core/contexts/AuthContext';
import { formatDateToUK } from '../../shared/utils/date-utils';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { ExpenseTrendChart } from './ExpenseTrendChart';
import { LocationSpendingChart } from './LocationSpendingChart';
import { BudgetSettingsModal } from './BudgetSettingsModal';
import { 
  CategoryData, 
  LocationData, 
  BudgetStatus,
  DateRangeOption,
  AnalyticsResponse
} from '../types';
import { ApiResponse } from '../../../core/types/expenses';
import { exportAnalyticsToCSV, exportAnalyticsToPDF } from '../api/exportService';
import { toast } from 'react-hot-toast';
import { ExportDialog } from './ExportDialog';
import { Button } from '../../../components/ui/button';

export default function AnalyticsPage() {
  const { user } = useAuth();
  // formatAmount is now imported directly
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeOption>('month');
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [trendData, setTrendData] = useState<{ daily: Array<{ date: string; amount: number }> }>({ daily: [] });
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [customDateType, setCustomDateType] = useState('month'); // 'month' or 'quarter'
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [spendingVelocity, setSpendingVelocity] = useState(0);
  const [projectedSpending, setProjectedSpending] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetTarget, setBudgetTarget] = useState(0);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  // Calculate totals
  const totalSpending = categoryData.reduce((total, item) => total + item.amount, 0);

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

  const handleDateRangeChange = (newRange: DateRangeOption): void => {
    setDateRange(newRange);
    if (newRange !== 'custom') {
      setShowDateRangeDropdown(false);
    }
  };

  // Add current month option to date range display
  const getCurrentMonthOption = (): React.ReactElement => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return (
      <button 
        onClick={() => {
          // Update state
          setDateRange('custom');
          setCustomDateType('month');
          setSelectedMonth(currentMonth);
          setSelectedYear(currentYear);
          setShowDateRangeDropdown(false);
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

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
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
            case 'quarter': {
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
            }
              
            case 'year': {
              // Last year - Jan 1 to Dec 31 of previous year
              startDate = new Date(endDate.getFullYear() - 1, 0, 1);
              endDate = new Date(endDate.getFullYear() - 1, 11, 31);
              break;
            }
              
            case 'month':
            default: {
              // Last month - 1st to last day of previous month
              const prevMonth = endDate.getMonth() - 1;
              const yearOfPrevMonth = prevMonth < 0 ? endDate.getFullYear() - 1 : endDate.getFullYear();
              const monthIndex = prevMonth < 0 ? 11 : prevMonth;
              
              startDate = new Date(yearOfPrevMonth, monthIndex, 1);
              endDate = new Date(yearOfPrevMonth, monthIndex + 1, 0);
              break;
            }
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
        
        let analyticsResponse: ApiResponse<AnalyticsResponse>;
        try {
          // Fetch analytics data
          analyticsResponse = await fetchExpenseAnalytics(dateRange, formattedStartDate, formattedEndDate);
          console.log('Analytics data received:', analyticsResponse);
        } catch (analyticsError) {
          console.error('Error fetching analytics data:', analyticsError);
          setError('Failed to load analytics data. Please try again.');
          setLoading(false);
          return;
        }

        if (!analyticsResponse.success || !analyticsResponse.data) {
          setError(analyticsResponse.message || 'Failed to load analytics data');
          setLoading(false);
          return;
        }

        const analyticsData = analyticsResponse.data;

        // Ensure numeric values for calculations
        const ensureNumber = (value: unknown): number => {
          if (typeof value === 'string') {
            return parseFloat(value) || 0;
          }
          return typeof value === 'number' ? value : 0;
        };
        
        // Map data to component state
        setCategoryData(analyticsData.categoryDistribution || []);
        setLocationData(analyticsData.locationDistribution || []);
        setTrendData({ daily: analyticsData.dailyTrend || [] });

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
        const weeklyAverage = analyticsData.totalSpent / weeksInPeriod;
        setSpendingVelocity(weeklyAverage);

        // Calculate projected spending for current month
        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
        const projected = calculateProjectedSpending(analyticsData.totalSpent, daysInPeriod, daysInMonth);
        setProjectedSpending(projected);

        // Update budget status with user's actual budget target
        const budgetTarget = ensureNumber(budgetSettings?.monthly_target) || 2000;
        const budgetProgress = (analyticsData.totalSpent / budgetTarget) * 100;
        const newBudgetStatus: BudgetStatus = {
          current: analyticsData.totalSpent,
          target: budgetTarget,
          status: budgetProgress > 90 ? 'at_risk' : budgetProgress > 75 ? 'warning' : 'on_track'
        };
        setBudgetStatus(newBudgetStatus);

        // Also fetch budget status
        const budgetResponse = await calculateBudgetStatus();
        if (budgetResponse.success && budgetResponse.data) {
          setBudgetStatus(budgetResponse.data);
          setBudgetTarget(budgetResponse.data.target);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalytics();
  }, [user, dateRange, customDateType, selectedMonth, selectedYear, selectedQuarter]);

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

  const handleExportClick = (format: 'pdf' | 'csv') => {
    setExportFormat(format);
    setIsExportDialogOpen(true);
  };

  const calculateProjectedSpending = (currentSpending: number, daysInPeriod: number, totalDays: number): number => {
    return (currentSpending / daysInPeriod) * totalDays;
  };

  const handleSaveBudget = async (budgetAmount: number): Promise<void> => {
    try {
      // We're using the open policy, so this will save the budget for the current user
      await saveBudgetSettings({ monthly_target: budgetAmount });
      
      // Update local budget state
      if (budgetStatus) {
        const current = budgetStatus.current;
        const budgetProgress = (current / budgetAmount) * 100;
        const newStatus: BudgetStatus = {
          current,
          target: budgetAmount,
          status: budgetProgress > 90 
            ? 'at_risk' 
            : budgetProgress > 75 
              ? 'warning' 
              : 'on_track'
        };
        setBudgetStatus(newStatus);
      }
      
    } catch (error) {
      console.error('Error saving budget:', error);
      throw error;
    }
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
    <div className="container mx-auto p-4 space-y-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Expense Analytics</h2>
          
          <div className="flex items-center space-x-3">
            {/* Export buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => handleExportClick('csv')}
                disabled={loading}
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportClick('pdf')}
                disabled={loading}
              >
                Export PDF
              </Button>
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
                            handleDateRangeChange('custom' as DateRangeOption);
                          }}
                          className={`flex-1 text-center py-2 text-sm rounded-md ${customDateType === 'month' && dateRange === 'custom' ? 'bg-rose-100 text-rose-700 font-medium' : 'hover:bg-gray-100'}`}
                        >
                          Month
                        </button>
                        <button 
                          onClick={() => {
                            setCustomDateType('quarter');
                            handleDateRangeChange('custom' as DateRangeOption);
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
            <p className="text-gray-500 mb-4">As you add expenses, you&apos;ll see analytics and insights here.</p>
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
                    budgetStatus?.status === 'on_track' 
                      ? 'bg-green-100 text-green-800' 
                      : budgetStatus?.status === 'warning' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {budgetStatus?.status === 'on_track' 
                      ? 'On Track' 
                      : budgetStatus?.status === 'warning' 
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
                      {budgetStatus ? Math.round((budgetStatus.current / budgetStatus.target) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-rose-600">
                      {formatAmount(budgetStatus?.current || 0)} / {formatAmount(budgetStatus?.target || 0)}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-rose-200">
                  <div 
                    style={{ width: `${budgetStatus ? Math.min(100, (budgetStatus.current / budgetStatus.target) * 100) : 0}%` }} 
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      budgetStatus?.status === 'on_track' 
                        ? 'bg-green-500' 
                        : budgetStatus?.status === 'warning' 
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
        currentBudget={budgetTarget}
        onSave={handleSaveBudget}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={{
          categoryData: categoryData,
          locationData: locationData,
          trendData: trendData.daily || [],
          totalSpent: totalSpending,
          budgetStatus: budgetStatus,
          dateRange: getDateRangeDisplayText()
        }}
        formatAmount={formatAmount}
      />
    </div>
  );
}