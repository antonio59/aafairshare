import { useState, useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import type { Budget as BudgetType, CategoryGroup, Category } from '../types';
import Dropdown from './common/Dropdown';

interface NewBudget {
  category: string;
  amount: string;
  period: 'monthly' | 'quarterly' | 'yearly';
}

const Budget = () => {
  const { budgets, addBudget, updateBudget: editBudget, deleteBudget, getBudgetProgress, categories, categoryGroups } = useExpenseStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetType | null>(null);
  const [newBudget, setNewBudget] = useState<NewBudget>({
    category: '',
    amount: '',
    period: 'monthly',
  });
  const [error, setError] = useState<string | null>(null);

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

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(newBudget.amount);
    if (!newBudget.category) {
      setError('Please select a category');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    addBudget({
      ...newBudget,
      amount,
    });
    setShowAddModal(false);
    setNewBudget({ category: '', amount: '', period: 'monthly' });
  };

  const handleEditBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBudget) return;

    const amount = parseFloat(selectedBudget.amount.toString());
    if (!selectedBudget.category) {
      setError('Please select a category');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    editBudget(selectedBudget.id, {
      ...selectedBudget,
      amount,
    });
    setShowEditModal(false);
    setSelectedBudget(null);
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <PlusCircle size={20} />
          Add Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const progress = getBudgetProgress(budget);
          const category = categories.find(c => c.id === budget.category);
          const group = category ? categoryGroups.find((g: CategoryGroup) => g.id === category.groupId) : null;
          
          return (
            <div
              key={budget.id}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{category?.name || 'Unknown Category'}</h3>
                  <p className="text-gray-600">
                    Budget: £{budget.amount.toFixed(2)} ({budget.period})
                  </p>
                  {group && (
                    <p className="text-sm text-gray-500">
                      Group: {group.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedBudget(budget);
                      setShowEditModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    progress > 100 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {progress.toFixed(1)}% used
              </p>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Budget</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleAddBudget} className="space-y-4">
              <Dropdown
                label="Category"
                value={newBudget.category}
                onChange={(value) => setNewBudget({ ...newBudget, category: value })}
                options={categoryOptions}
                placeholder="Select a category"
                required
                groupBy
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({
                    ...newBudget,
                    amount: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({
                    ...newBudget,
                    period: e.target.value as 'monthly' | 'quarterly' | 'yearly',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Budget</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleEditBudget} className="space-y-4">
              <Dropdown
                label="Category"
                value={selectedBudget.category}
                onChange={(value) => setSelectedBudget({
                  ...selectedBudget,
                  category: value
                })}
                options={categoryOptions}
                placeholder="Select a category"
                required
                groupBy
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={selectedBudget.amount}
                  onChange={(e) => setSelectedBudget({
                    ...selectedBudget,
                    amount: parseFloat(e.target.value),
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={selectedBudget.period}
                  onChange={(e) => setSelectedBudget({
                    ...selectedBudget,
                    period: e.target.value as 'monthly' | 'quarterly' | 'yearly',
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedBudget(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
