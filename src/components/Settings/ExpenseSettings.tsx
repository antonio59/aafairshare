import React from 'react';
import CategoryGroupSettings from './CategoryGroupSettings';
import TagSettings from './TagSettings';
import RecurringExpenses from './RecurringExpenses';
import Budget from '../Budget';
import { Tag, Receipt, Clock, PieChart } from 'lucide-react';

interface ExpenseSettingsProps {
  onClose?: () => void;
}

const ExpenseSettings: React.FC<ExpenseSettingsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'categories' | 'tags' | 'recurring' | 'budgets'>('categories');

  const tabs = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'tags', label: 'Tags', icon: Receipt },
    { id: 'recurring', label: 'Recurring', icon: Clock },
    { id: 'budgets', label: 'Budgets', icon: PieChart }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 px-4">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Expense Settings</h2>
        </div>
        
        {/* Mobile Tab Navigation */}
        <div className="sm:hidden grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-colors min-h-[48px] ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-2 py-3 px-6 border-b-2 transition-colors min-h-[48px] ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'categories' && <CategoryGroupSettings onClose={onClose} />}
        {activeTab === 'tags' && <TagSettings onClose={onClose} />}
        {activeTab === 'recurring' && <RecurringExpenses onClose={onClose} />}
        {activeTab === 'budgets' && <Budget />}
      </div>

      {/* Close button for mobile */}
      {onClose && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:mt-8">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 min-h-[48px] sm:float-right"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseSettings;
