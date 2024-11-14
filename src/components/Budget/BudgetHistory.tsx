import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useExpenseStore } from '../../store/expenseStore';
import { Download, Filter } from 'lucide-react';
import type { BudgetActionType } from '../../types';

interface FilterState {
  startDate: string;
  endDate: string;
  actionTypes: BudgetActionType[];
  categories: string[];
}

const BudgetHistory: React.FC = () => {
  const { getBudgetHistory, generateBudgetReport, categories } = useExpenseStore();
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    actionTypes: [],
    categories: []
  });
  const [showFilters, setShowFilters] = useState(false);

  const actionTypeOptions: BudgetActionType[] = ['created', 'increased', 'decreased', 'deleted'];

  const history = useMemo(() => {
    return getBudgetHistory(filters);
  }, [getBudgetHistory, filters]);

  const handleExport = () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Please select a date range for the report');
      return;
    }

    const report = generateBudgetReport(filters.startDate, filters.endDate);
    
    // Create CSV content
    const csvContent = [
      // Header
      ['Date', 'Action', 'Category', 'Old Value', 'New Value', 'User'].join(','),
      // Data rows
      ...history.map(item => [
        format(new Date(item.timestamp), 'dd MMM yyyy, HH:mm'),
        item.actionType,
        categories.find(c => c.id === item.category)?.name || 'Unknown',
        item.oldValue?.toFixed(2) || '-',
        item.newValue?.toFixed(2) || '-',
        item.userName
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action: BudgetActionType) => {
    switch (action) {
      case 'created':
        return 'text-green-600';
      case 'increased':
        return 'text-blue-600';
      case 'decreased':
        return 'text-orange-600';
      case 'deleted':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Budget History</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <Filter size={20} />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Types
              </label>
              <select
                multiple
                value={filters.actionTypes}
                onChange={(e) => setFilters({
                  ...filters,
                  actionTypes: Array.from(e.target.selectedOptions, option => option.value as BudgetActionType)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {actionTypeOptions.map(action => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <select
                multiple
                value={filters.categories}
                onChange={(e) => setFilters({
                  ...filters,
                  categories: Array.from(e.target.selectedOptions, option => option.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Old Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => {
              const category = categories.find(c => c.id === item.category);
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(item.timestamp), 'dd MMM yyyy, HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getActionColor(item.actionType)}`}>
                      {item.actionType.charAt(0).toUpperCase() + item.actionType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category?.name || 'Unknown Category'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.oldValue ? `£${item.oldValue.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.newValue ? `£${item.newValue.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.userName}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetHistory;
