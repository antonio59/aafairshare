'use client';

import { useState, useEffect } from 'react';
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
import { MultiSelect } from './ui/multi-select';
import Dropdown from './common/Dropdown';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import type { Expense, Category, CategoryGroup, Tag } from '@/types';
import { auditLog, AUDIT_LOG_TYPE } from '../utils/auditLogger';

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

interface AnalyticsData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  insights: {
    totalSpent: number;
    averageExpense: number;
    expenseCount: number;
    monthlyTrend: {
      labels: string[];
      data: number[];
    };
    categoryBreakdown: {
      labels: string[];
      data: number[];
      colors: string[];
    };
    tagAnalysis: {
      labels: string[];
      data: number[];
    };
    splitAnalysis: {
      labels: string[];
      data: number[];
    };
  };
}

export function AnalyticsClient() {
  // State
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('current');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPaidBy, setSelectedPaidBy] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState<'excel' | 'pdf' | null>(null);

  // Load data from server component
  useEffect(() => {
    const dataScript = document.getElementById('analytics-data');
    if (dataScript) {
      const analyticsData = JSON.parse(dataScript.innerHTML);
      setData(analyticsData);
    }
  }, []);

  if (!data) return null;

  const { insights, categories, categoryGroups, tags } = data;

  // Options for dropdowns
  const timeRangeOptions = [
    { value: 'current', label: 'Current Month' },
    { value: 'last', label: 'Last Month' },
    { value: '3', label: 'Last 3 months' },
    { value: '6', label: 'Last 6 months' },
    { value: '12', label: 'Last 12 months' }
  ];

  const categoryOptions = categories
    .filter((cat): cat is Category => cat !== null)
    .map(cat => {
      const group = categoryGroups.find(g => g.id === cat.groupId);
      return {
        value: cat.id,
        label: cat.name,
        icon: cat.icon,
        group: group?.name || 'Other'
      };
    });

  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
  }));

  const paidByOptions = [
    { value: 'Andres', label: 'Andres' },
    { value: 'Antonio', label: 'Antonio' }
  ];

  // Add this function to get the current user ID
  function getCurrentUserId() {
    // This is a placeholder - implement according to your auth system
    return 'system';
  }

  // Export handlers
  const handleExport = async (type: 'excel' | 'pdf') => {
    if (!data) return;
    
    setIsExporting(type);
    try {
      if (type === 'excel') {
        await exportToExcel({
          data: data.expenses,
          title: 'Expenses Export',
          columns: [
            { header: 'Date', key: 'date' },
            { header: 'Amount', key: 'amount' },
            { header: 'Category', key: 'category' },
            { header: 'Description', key: 'description' },
            { header: 'Paid By', key: 'paidBy' }
          ]
        });
        
        // Fix auditLog call with all required parameters
        await auditLog(
          AUDIT_LOG_TYPE.DATA_CREATE,
          'Created analytics report',
          { reportType: 'excel' },
          getCurrentUserId()
        );
      } else {
        await exportToPDF({
          data: data.expenses,
          title: 'Expenses Export',
          columns: [
            { header: 'Date', key: 'date' },
            { header: 'Amount', key: 'amount' },
            { header: 'Category', key: 'category' },
            { header: 'Description', key: 'description' },
            { header: 'Paid By', key: 'paidBy' }
          ]
        });
        
        // Fix auditLog call with all required parameters
        await auditLog(
          AUDIT_LOG_TYPE.DATA_CREATE,
          'Created analytics report',
          { reportType: 'pdf' },
          getCurrentUserId()
        );
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(null);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
          <p className="text-2xl font-bold mt-1">£{insights.totalSpent.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">This period</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Expense</h3>
          <p className="text-2xl font-bold mt-1">£{insights.averageExpense.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Per transaction</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Number of Expenses</h3>
          <p className="text-2xl font-bold mt-1">{insights.expenseCount}</p>
          <p className="text-sm text-gray-500 mt-1">This period</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
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
          />
          <MultiSelect
            label="Tags"
            options={tagOptions}
            selected={selectedTags}
            onChange={setSelectedTags}
            placeholder="Select tags..."
          />
          <MultiSelect
            label="Paid By"
            options={paidByOptions}
            selected={selectedPaidBy}
            onChange={setSelectedPaidBy}
            placeholder="Select payers..."
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
              data={{
                labels: insights.monthlyTrend.labels,
                datasets: [{
                  label: 'Monthly Spending',
                  data: insights.monthlyTrend.data,
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.1)',
                  tension: 0.1,
                  fill: true
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `£${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      callback: function(value) {
                        return `£${value}`;
                      }
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
              data={{
                labels: insights.categoryBreakdown.labels,
                datasets: [{
                  data: insights.categoryBreakdown.data,
                  backgroundColor: insights.categoryBreakdown.colors,
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `£${context.raw}`;
                      }
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
              data={{
                labels: insights.tagAnalysis.labels,
                datasets: [{
                  label: 'Spending by Tag',
                  data: insights.tagAnalysis.data,
                  backgroundColor: 'rgba(54, 162, 235, 0.5)',
                  borderColor: 'rgb(54, 162, 235)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `£${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return `£${value}`;
                      }
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
              data={{
                labels: insights.splitAnalysis.labels,
                datasets: [
                  {
                    label: 'Andres',
                    data: [insights.splitAnalysis.data[0], insights.splitAnalysis.data[2]],
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                  },
                  {
                    label: 'Antonio',
                    data: [insights.splitAnalysis.data[1], insights.splitAnalysis.data[3]],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `£${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return `£${value}`;
                      }
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
}
