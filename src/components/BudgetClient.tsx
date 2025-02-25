'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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
  const [, setCategories] = useState<Category[]>([]);
  const [, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('budgets');
  const [, ] = useState<NewBudget>({
    category: '',
    amount: '',
    period: 'monthly',
  });


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

  const [, setSelectedBudget] = useState<Budget | null>(null);

  // Event handlers

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
