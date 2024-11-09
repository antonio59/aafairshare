import React, { useState, useMemo } from 'react';
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
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useExpenseStore } from '../store/expenseStore';
import { useUserStore } from '../store/userStore';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isSameMonth } from 'date-fns';
import Select from 'react-select';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Users, Calendar } from 'lucide-react';

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

const CATEGORY_GROUPS = [
  'Utilities',
  'Housing',
  'Food',
  'Transportation',
  'Insurance',
  'Entertainment',
  'Clothing',
  'Health and wellness',
  'Miscellaneous',
] as const;

const Analytics = () => {
  const { expenses, categories, tags } = useExpenseStore();
  const { currentUser } = useUserStore();
  const [timeRange, setTimeRange] = useState({ value: 'current', label: 'Current Month' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaidBy, setSelectedPaidBy] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const timeRangeOptions = [
    { value: 'current', label: 'Current Month' },
    { value: 'last', label: 'Last Month' },
    { value: '3', label: 'Last 3 months' },
    { value: '6', label: 'Last 6 months' },
    { value: '12', label: 'Last 12 months' }
  ];

  // Group categories for the select input
  const groupedCategories = useMemo(() => {
    const groups = CATEGORY_GROUPS.map(group => ({
      label: group,
      options: categories
        .filter(cat => cat.group === group)
        .map(cat => ({
          value: cat.id,
          label: cat.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    })).filter(group => group.options.length > 0);

    return groups;
  }, [categories]);

  const tagOptions = useMemo(() => 
    tags.map(tag => ({
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
    let startDate: Date;
    let endDate = endOfMonth(now);

    switch (timeRange.value) {
      case 'current':
        startDate = startOfMonth(now);
        break;
      case 'last':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      default:
        startDate = subMonths(startOfMonth(now), parseInt(timeRange.value) - 1);
    }

    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const matchesTimeRange = expenseDate >= startDate && expenseDate <= endDate;
      const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
      const matchesPaidBy = selectedPaidBy.length === 0 || selectedPaidBy.includes(expense.paidBy);
      const matchesTags = selectedTags.length === 0 || 
        (expense.tags && expense.tags.some(tag => selectedTags.includes(tag)));

      return matchesTimeRange && matchesCategories && matchesPaidBy && matchesTags;
    });
  }, [expenses, timeRange.value, selectedCategories, selectedPaidBy, selectedTags]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgPerDay = total / (filteredExpenses.length || 1);
    
    // Calculate previous period metrics for comparison
    const now = new Date();
    const currentPeriodStart = startOfMonth(now);
    const previousPeriodStart = subMonths(currentPeriodStart, 1);
    
    const previousPeriodExpenses = expenses.filter(exp => {
      const date = parseISO(exp.date);
      return date >= previousPeriodStart && date < currentPeriodStart;
    });
    
    const previousTotal = previousPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentChange = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : 0;

    const topCategory = Object.entries(
      filteredExpenses.reduce((acc, exp) => {
        const catName = categories.find(c => c.id === exp.category)?.name || 'Unknown';
        acc[catName] = (acc[catName] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a)[0];

    return {
      total,
      avgPerDay,
      percentChange,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
    };
  }, [filteredExpenses, categories, expenses]);

  // Monthly spending trend data
  const monthlyTrendData = useMemo(() => {
    const months: { [key: string]: number } = {};
    const endDate = new Date();
    const monthCount = timeRange.value === 'current' ? 1 : 
                      timeRange.value === 'last' ? 1 :
                      parseInt(timeRange.value);
    const startDate = subMonths(startOfMonth(endDate), monthCount - 1);

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
        tension: 0.1,
        fill: false
      }]
    };
  }, [filteredExpenses, timeRange.value]);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    const categoryColors: { [key: string]: string } = {};

    filteredExpenses.forEach(expense => {
      const category = categories.find(c => c.id === expense.category);
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

  // Split analysis data with detailed breakdown
  const splitAnalysisData = useMemo(() => {
    const totals = {
      Andres: { paid: 0, share: 0, categories: {} as Record<string, number> },
      Antonio: { paid: 0, share: 0, categories: {} as Record<string, number> }
    };

    filteredExpenses.forEach(expense => {
      const amount = expense.amount;
      const category = categories.find(c => c.id === expense.category)?.name || 'Unknown';
      
      // Track who paid
      if (expense.paidBy === 'Andres') {
        totals.Andres.paid += amount;
        totals.Andres.categories[category] = (totals.Andres.categories[category] || 0) + amount;
      } else {
        totals.Antonio.paid += amount;
        totals.Antonio.categories[category] = (totals.Antonio.categories[category] || 0) + amount;
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

    const balance = totals.Andres.paid - totals.Andres.share;

    return {
      summary: {
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
      },
      details: {
        Andres: totals.Andres,
        Antonio: totals.Antonio,
        balance
      }
    };
  }, [filteredExpenses, categories]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Spending</p>
              <p className="text-2xl font-semibold">£{summaryMetrics.total.toFixed(2)}</p>
              <p className={`text-sm ${summaryMetrics.percentChange > 0 ? 'text-red-500' : 'text-green-500'} flex items-center mt-1`}>
                {summaryMetrics.percentChange > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {Math.abs(summaryMetrics.percentChange).toFixed(1)}% vs previous
              </p>
            </div>
            <DollarSign size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Daily Average</p>
              <p className="text-2xl font-semibold">£{summaryMetrics.avgPerDay.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Per day</p>
            </div>
            <Calendar size={24} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Top Category</p>
              <p className="text-2xl font-semibold">{summaryMetrics.topCategory?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-1">
                £{summaryMetrics.topCategory?.amount.toFixed(2) || '0.00'}
              </p>
            </div>
            <PieChart size={24} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Settlement Balance</p>
              <p className="text-2xl font-semibold">
                £{Math.abs(splitAnalysisData.details.balance).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {splitAnalysisData.details.balance > 0 ? 'Antonio owes Andres' : 'Andres owes Antonio'}
              </p>
            </div>
            <Users size={24} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <Select
              value={timeRange}
              onChange={(option) => setTimeRange(option || timeRangeOptions[0])}
              options={timeRangeOptions}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <Select
              isMulti
              value={groupedCategories
                .flatMap(group => group.options)
                .filter(option => selectedCategories.includes(option.value))}
              onChange={(options) => setSelectedCategories(options.map(opt => opt.value))}
              options={groupedCategories}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <Select
              isMulti
              value={tagOptions.filter(option => selectedTags.includes(option.value))}
              onChange={(options) => setSelectedTags(options.map(opt => opt.value))}
              options={tagOptions}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid By
            </label>
            <Select
              isMulti
              value={paidByOptions.filter(option => selectedPaidBy.includes(option.value))}
              onChange={(options) => setSelectedPaidBy(options.map(opt => opt.value))}
              options={paidByOptions}
              className="w-full"
            />
          </div>
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
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Split Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Split Analysis</h3>
          <div className="h-[300px] mb-4">
            <Bar
              data={splitAnalysisData.summary}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Andres</h4>
              <p className="text-sm text-gray-600">Paid: £{splitAnalysisData.details.Andres.paid.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Share: £{splitAnalysisData.details.Andres.share.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Antonio</h4>
              <p className="text-sm text-gray-600">Paid: £{splitAnalysisData.details.Antonio.paid.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Share: £{splitAnalysisData.details.Antonio.share.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-center font-medium">
              {splitAnalysisData.details.balance > 0 ? 'Antonio owes Andres' : 'Andres owes Antonio'}{' '}
              <span className="text-blue-600">£{Math.abs(splitAnalysisData.details.balance).toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
