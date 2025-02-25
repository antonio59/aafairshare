'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { MultiSelect } from './ui/multi-select';
import type { Budget, Category, CategoryGroup } from '@/types';
import BudgetHistory from './Budget/BudgetHistory';
import BudgetReport from './Budget/BudgetReport';

interface NewBudget {
  category: string;
  amount: string;
  period: 'monthly' | 'quarterly' | 'yearly';
}

type TabType = 'budgets' | 'history' | 'report';

export function BudgetClient() {
  // State
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('budgets');
  const [newBudget, setNewBudget] = useState<NewBudget>({
    category: '',
    amount: '',
    period: 'monthly',
  });
  const [error, setError] = useState<string | null>(null);

  // Load data from server component
  useEffect(() => {
    const dataScript = document.getElementById('budget-data');
    if (dataScript) {
      const data = JSON.parse(dataScript.innerHTML);
      setBudgets(data.budgets);
      setCategories(data.categories);
      setCategoryGroups(data.categoryGroups);
    }
  }, []);

  // Handlers
  const handleAddBudget = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBudget, amount }),
      });

      if (!response.ok) throw new Error('Failed to create budget');

      const newBudgetData = await response.json();
      setBudgets([newBudgetData, ...budgets]);
      setShowAddModal(false);
      setNewBudget({ category: '', amount: '', period: 'monthly' });
    } catch (err) {
      setError('Failed to create budget. Please try again.');
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch('/api/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedBudget),
      });

      if (!response.ok) throw new Error('Failed to update budget');

      const updatedBudget = await response.json();
      setBudgets(budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b));
      setShowEditModal(false);
      setSelectedBudget(null);
    } catch (err) {
      setError('Failed to update budget. Please try again.');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete budget');

      setBudgets(budgets.filter(b => b.id !== id));
    } catch (err) {
      setError('Failed to delete budget. Please try again.');
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return <BudgetHistory />;
      case 'report':
        return <BudgetReport />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => (
              <div key={budget.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Budget card content */}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {['budgets', 'history', 'report'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {activeTab === 'budgets' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Budget
          </button>
        )}
      </div>

      {renderContent()}

      {/* Add Budget Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Budget</DialogTitle>
          </DialogHeader>
          {/* Add Budget Form */}
        </DialogContent>
      </Dialog>

      {/* Edit Budget Modal */}
      <Dialog 
        open={showEditModal} 
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setSelectedBudget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {/* Edit Budget Form */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
