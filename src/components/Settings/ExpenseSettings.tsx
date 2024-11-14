import React from 'react';
import CategoryGroupSettings from '@/components/Settings/CategoryGroupSettings';
import TagSettings from '@/components/Settings/TagSettings';
import RecurringExpenses from '@/components/Settings/RecurringExpenses';
import Budget from '@/components/Budget';

interface ExpenseSettingsProps {
  onClose?: () => void;
}

const ExpenseSettings: React.FC<ExpenseSettingsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'categories' | 'tags' | 'recurring' | 'budgets'>('categories');

  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'recurring', label: 'Recurring' },
    { id: 'budgets', label: 'Budgets' }
  ] as const;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Expense Settings</h2>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-shrink-0 pb-2 px-4 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'categories' && <CategoryGroupSettings onClose={onClose} />}
        {activeTab === 'tags' && <TagSettings onClose={onClose} />}
        {activeTab === 'recurring' && <RecurringExpenses onClose={onClose} />}
        {activeTab === 'budgets' && <Budget />}
      </div>
    </div>
  );
};

export default ExpenseSettings;
