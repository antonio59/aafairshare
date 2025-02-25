import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Scale,
} from 'chart.js';
import type { CoreScaleOptions, Tick, TooltipItem } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useExpenseStore } from '../store/expenseStore';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isSameMonth } from 'date-fns';
import Dropdown from './common/Dropdown';
import { MultiSelect } from './ui/multi-select';
import type { Category } from '../types';

// SelectOption type is now imported from MultiSelect component
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Analytics = () => {
  const { expenses, categories, categoryGroups, tags } = useExpenseStore();
  const [timeRange, setTimeRange] = useState('current');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // These types are used in chart configurations
  // type SelectOption = { value: string; label: string; };
  // type ChartTooltipItem = { raw: unknown; };
  // type ChartTickValue = string | number;
  // type ChartTick = { value: number; };
  // type ChartScale = { options: CoreScaleOptions; };
  type ChartCallback = (this: Scale<CoreScaleOptions>, tickValue: string | number, index: number, ticks: Tick[]) => string;
  const [selectedPaidBy, setSelectedPaidBy] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);

  const timeRangeOptions = [
    { value: 'current', label: 'Current Month' },
    { value: 'last', label: 'Last Month' },
    { value: '3', label: 'Last 3 months' },
    { value: '6', label: 'Last 6 months' },
    { value: '12', label: 'Last 12 months' }
  ];

  // Convert categories for the dropdown with proper grouping
  const categoryOptions = useMemo(() => 
    categories
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
      }),
    [categories, categoryGroups]
  );

  const tagOptions = useMemo(() => 
    tags
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(tag => ({
        value: tag.id,
        label: tag.name,
      }))
  , [tags]);

  const paidByOptions = [
    { value: 'Andres', label: 'Andres' },
    { value: 'Antonio', label: 'Antonio' }
  ];

  // Filter expenses based on selected criteria
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let filterStartDate: Date;
    let endDate = endOfMonth(now);

    switch (timeRange) {
      case 'current':
        filterStartDate = startOfMonth(now);
        break;
      case 'last':
        filterStartDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      default:
        filterStartDate = startOfMonth(subMonths(now, parseInt(timeRange) - 1));
    }

    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const matchesTimeRange = expenseDate >= filterStartDate && expenseDate <= endDate;
      const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
      const matchesPaidBy = selectedPaidBy.length === 0 || selectedPaidBy.includes(expense.paidBy);
      const matchesTags = selectedTags.length === 0 || 
        (expense.tags && expense.tags.some(tag => selectedTags.includes(tag)));

      return matchesTimeRange && matchesCategories && matchesPaidBy && matchesTags;
    });
  }, [expenses, timeRange, selectedCategories, selectedPaidBy, selectedTags]);

  // Handle exports
  const handleExport = async (type: 'excel' | 'pdf') => {
    setIsExporting(type);
    try {
      const now = new Date();
      const month = format(now, 'yyyy-MM');
      
      if (type === 'excel') {
        await exportToExcel(filteredExpenses, categories, tags, month);
      } else {
        exportToPDF(filteredExpenses, categories, tags, month);
      }
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
    } finally {
      setIsExporting(null);
    }
  };

  // Calculate insights
  const insights = useMemo(() => {
    const now = new Date();
    const currentMonthExpenses = expenses.filter(expense => 
      isSameMonth(parseISO(expense.date), now)
    );
    const lastMonthExpenses = expenses.filter(expense => 
      isSameMonth(parseISO(expense.date), subMonths(now, 1))
    );

    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyChange = ((currentTotal - lastTotal) / lastTotal) * 100;

    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      const category = categories.find(c => c?.id === expense.category);
      if (category) {
        acc[category.id] = (acc[category.id] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0];
    
    const topCategoryName = topCategory 
      ? categories.find(c => c?.id === topCategory[0])?.name 
      : 'None';

    const averageExpense = currentMonthExpenses.length > 0
      ? currentTotal / currentMonthExpenses.length
      : 0;

    return {
      currentTotal,
      monthlyChange,
      topCategory: topCategoryName,
      averageExpense,
      expenseCount: currentMonthExpenses.length
    };
  }, [expenses, categories]);

  // Monthly spending trend data
  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const endDate = new Date();
    const monthCount = timeRange === 'current' ? 1 : 
                      timeRange === 'last' ? 1 :
                      parseInt(timeRange);
    for (let i = 0; i < monthCount; i++) {
      const monthDate = subMonths(endDate, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      months[monthKey] = 0;
    }

    filteredExpenses.forEach(expense => {
      const monthKey = format(parseISO(expense.date), 'yyyy-MM');
      if (months[monthKey] !== undefined) {
        months[monthKey] += expense.amount;
      }
    });

    return {
      labels: Object.keys(months).reverse().map(date => format(parseISO(date), 'MMM yyyy')),
      datasets: [{
        label: 'Monthly Spending',
        data: Object.values(months).reverse(),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };
  }, [filteredExpenses, timeRange]);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    const categoryColors: { [key: string]: string } = {};

    filteredExpenses.forEach(expense => {
      const category = categories.find(c => c?.id === expense.category);
      if (category) {
        categoryTotals[category.name] = (categoryTotals[category.name] || 0) + expense.amount;
        categoryColors[category.name] = category.color;
      }
    });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: Object.values(categoryColors),
        borderWidth: 1
      }]
    };
  }, [filteredExpenses, categories]);

  // Tag analysis data
  const tagAnalysisData = useMemo(() => {
    const tagTotals: { [key: string]: number } = {};

    filteredExpenses.forEach(expense => {
      if (expense.tags) {
        expense.tags.forEach(tagId => {
          const tag = tags.find(t => t.id === tagId);
          if (tag) {
            tagTotals[tag.name] = (tagTotals[tag.name] || 0) + expense.amount;
          }
        });
      }
    });

    const sortedTags = Object.entries(tagTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      labels: sortedTags.map(([name]) => name),
      datasets: [{
        label: 'Spending by Tag',
        data: sortedTags.map(([, value]) => value),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    };
  }, [filteredExpenses, tags]);

  // Split analysis data
  const splitAnalysisData = useMemo(() => {
    const totals = {
      Andres: { paid: 0, share: 0 },
      Antonio: { paid: 0, share: 0 }
    };

    filteredExpenses.forEach(expense => {
      const amount = expense.amount;
      
      // Track who paid
      if (expense.paidBy === 'Andres') {
        totals.Andres.paid += amount;
      } else {
        totals.Antonio.paid += amount;
      }

      // Calculate shares
      if (expense.split === 'equal') {
        totals.Andres.share += amount / 2;
        totals.Antonio.share += amount / 2;
      } else {
        if (expense.paidBy === 'Andres') {
          totals.Andres.share += amount;
        } else {
          totals.Antonio.share += amount;
        }
      }
    });

    return {
      labels: ['Amount Paid', 'Fair Share'],
      datasets: [
        {
          label: 'Andres',
          data: [totals.Andres.paid, totals.Andres.share],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Antonio',
          data: [totals.Antonio.paid, totals.Antonio.share],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
  }, [filteredExpenses]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16 mb-20">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Current Month Total</h3>
          <p className="text-2xl font-bold mt-1">£{insights.currentTotal.toFixed(2)}</p>
          <p className={`text-sm mt-1 ${
            insights.monthlyChange > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {insights.monthlyChange > 0 ? '↑' : '↓'} {Math.abs(insights.monthlyChange).toFixed(1)}% vs last month
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Top Category</h3>
          <p className="text-2xl font-bold mt-1">{insights.topCategory}</p>
          <p className="text-sm text-gray-500 mt-1">Most spent category</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Expense</h3>
          <p className="text-2xl font-bold mt-1">£{insights.averageExpense.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Per transaction</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Number of Expenses</h3>
          <p className="text-2xl font-bold mt-1">{insights.expenseCount}</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting !== null}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${isExporting === 'excel'
                  ? 'bg-green-100 text-green-800 cursor-wait'
                  : 'bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isExporting === 'excel' ? 'Exporting...' : 'Excel'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${isExporting === 'pdf'
                  ? 'bg-blue-100 text-blue-800 cursor-wait'
                  : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isExporting === 'pdf' ? 'Exporting...' : 'PDF'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Dropdown
            label="Time Range"
            value={timeRange}
            onChange={setTimeRange}
            options={timeRangeOptions}
            placeholder="Select time range"
          />
          <MultiSelect
            label="Categories"
            options={categoryOptions}
            selected={selectedCategories}
            onChange={setSelectedCategories}
            placeholder="Select categories..."
            className="w-full"
          />
          <MultiSelect
            label="Tags"
            options={tagOptions}
            selected={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags..."
            className="w-full"
          />
          <MultiSelect
            label="Paid By"
            options={paidByOptions}
            selected={selectedPaidBy}
            onChange={setSelectedPaidBy}
            placeholder="Select payers..."
            className="w-full"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
          <div className="h-[300px]">
            <Line
              data={monthlyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(this: unknown, tooltipItem: TooltipItem<'bar' | 'line' | 'doughnut'>) { return `£${Number(tooltipItem.raw)}`; }
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: function(this: Scale<CoreScaleOptions>, value: string | number) { return `£${value}`; } as ChartCallback
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="h-[300px]">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(this: unknown, tooltipItem: TooltipItem<'bar' | 'line' | 'doughnut'>) { return `£${Number(tooltipItem.raw)}`; }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Tag Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 Tags by Spending</h3>
          <div className="h-[300px]">
            <Bar
              data={tagAnalysisData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(this: unknown, tooltipItem: TooltipItem<'bar' | 'line' | 'doughnut'>) { return `£${Number(tooltipItem.raw)}`; }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(this: Scale<CoreScaleOptions>, value: string | number) { return `£${value}`; } as ChartCallback
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Split Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Split Analysis</h3>
          <div className="h-[300px]">
            <Bar
              data={splitAnalysisData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(this: unknown, tooltipItem: TooltipItem<'bar' | 'line' | 'doughnut'>) { return `£${Number(tooltipItem.raw)}`; }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(this: Scale<CoreScaleOptions>, value: string | number) { return `£${value}`; } as ChartCallback
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
