import { useState, useMemo } from 'react';
import { useExpenseStore } from '../store/expenseStore';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import Select from 'react-select';
import type { Budget as BudgetType, CategoryGroup } from '../types';

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

  // Group categories for the select input
  const groupedCategories = useMemo(() => {
    const groups = Object.entries(
      categories.reduce<Record<string, typeof categories>>((acc, cat) => {
        if (!cat) return acc;
        const group = categoryGroups.find((g: CategoryGroup) => g.id === cat.groupId);
        if (!group) return acc;
        if (!acc[group.name]) acc[group.name] = [];
        acc[group.name].push(cat);
        return acc;
      }, {})
    ).map(([groupName, cats]) => ({
      label: groupName,
      options: cats
        .map(cat => ({
          value: cat.id,
          label: cat.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    })).filter(group => group.options.length > 0);

    return groups;
  }, [categories, categoryGroups]);

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={
                    newBudget.category
                      ? {
                          value: newBudget.category,
                          label: categories.find(c => c.id === newBudget.category)?.name
                        }
                      : null
                  }
                  onChange={(option) => setNewBudget({ ...newBudget, category: option?.value || '' })}
                  options={groupedCategories}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Select a category"
                  required
                />
              </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={
                    selectedBudget.category
                      ? {
                          value: selectedBudget.category,
                          label: categories.find(c => c.id === selectedBudget.category)?.name
                        }
                      : null
                  }
                  onChange={(option) => setSelectedBudget({
                    ...selectedBudget,
                    category: option?.value || ''
                  })}
                  options={groupedCategories}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Select a category"
                  required
                />
              </div>

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
