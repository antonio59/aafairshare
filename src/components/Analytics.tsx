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
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useExpenseStore } from '../store/expenseStore';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isSameMonth } from 'date-fns';
import Select from 'react-select';

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
    const groups = categoryGroups
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        label: group.name,
        options: categories
          .filter(cat => cat?.groupId === group.id)
          .map(cat => ({
            value: cat.id,
            label: cat.name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      }))
      .filter(group => group.options.length > 0);

    return groups;
  }, [categories, categoryGroups]);

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
        startDate = startOfMonth(subMonths(now, parseInt(timeRange.value) - 1));
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
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };
  }, [filteredExpenses, timeRange.value]);

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
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `£${context.raw as number}`
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => `£${value}`
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
                      label: (context) => `£${context.raw as number}`
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
                      label: (context) => `£${context.raw as number}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `£${value}`
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
                      label: (context) => `£${context.raw as number}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `£${value}`
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
