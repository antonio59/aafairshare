import React, { useState, useMemo } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const BudgetReport: React.FC = () => {
  const { generateBudgetReport, categories } = useExpenseStore();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const report = useMemo(() => {
    if (!startDate || !endDate) return null;
    return generateBudgetReport(startDate, endDate);
  }, [generateBudgetReport, startDate, endDate]);

  const handleExport = () => {
    if (!report) return;

    // Create CSV content
    const csvContent = [
      // Summary section
      ['Budget Changes Summary'],
      ['Period', `${report.startDate} to ${report.endDate}`],
      [''],
      ['Action Type', 'Count'],
      ['Created', report.changes.created],
      ['Increased', report.changes.increased],
      ['Decreased', report.changes.decreased],
      ['Deleted', report.changes.deleted],
      [''],
      ['Category Trends'],
      ['Category', 'Change %'],
      ...report.categoryTrends.map(trend => [
        categories.find(c => c.id === trend.categoryId)?.name || 'Unknown',
        `${trend.percentageChange.toFixed(2)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => {
    if (!report) return [];
    return report.categoryTrends.map(trend => ({
      name: categories.find(c => c.id === trend.categoryId)?.name || 'Unknown',
      change: parseFloat(trend.percentageChange.toFixed(2))
    }));
  }, [report, categories]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Budget Report</h2>
        <button
          onClick={handleExport}
          disabled={!report}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            report
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Download size={20} />
          Export Report
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {report && (
        <div className="space-y-8">
          {/* Changes Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Budget Changes Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-2xl font-bold">{report.changes.created}</div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-2xl font-bold">{report.changes.increased}</div>
                <div className="text-sm text-gray-600">Increased</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-orange-600 text-2xl font-bold">{report.changes.decreased}</div>
                <div className="text-sm text-gray-600">Decreased</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-600 text-2xl font-bold">{report.changes.deleted}</div>
                <div className="text-sm text-gray-600">Deleted</div>
              </div>
            </div>
          </div>

          {/* Category Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Category Trends</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Change %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="change"
                    fill="#3B82F6"
                    name="Budget Change %"
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Category Changes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Detailed Category Changes</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.categoryTrends.map((trend) => (
                    <tr key={trend.categoryId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(c => c.id === trend.categoryId)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`font-medium ${
                            trend.percentageChange > 0
                              ? 'text-green-600'
                              : trend.percentageChange < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {trend.percentageChange > 0 ? '+' : ''}
                          {trend.percentageChange.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!report && startDate && endDate && (
        <div className="text-center py-12 text-gray-500">
          No budget changes found for the selected period.
        </div>
      )}

      {!startDate || !endDate ? (
        <div className="text-center py-12 text-gray-500">
          Please select both start and end dates to generate the report.
        </div>
      ) : null}
    </div>
  );
};

export default BudgetReport;
