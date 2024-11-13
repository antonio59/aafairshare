import React from 'react';
import CategoryGroupSettings from './CategoryGroupSettings';
import TagSettings from './TagSettings';
import RecurringExpenses from './RecurringExpenses';
import ImportSettings from './ImportSettings';

interface ExpenseSettingsProps {
  onClose?: () => void;
}

const ExpenseSettings: React.FC<ExpenseSettingsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'categories' | 'tags' | 'recurring' | 'import'>('categories');

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Expense Settings</h2>
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`pb-2 px-1 ${
              activeTab === 'categories'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'tags'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('tags')}
          >
            Tags
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'recurring'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('recurring')}
          >
            Recurring Expenses
          </button>
          <button
            className={`pb-2 px-1 ${
              activeTab === 'import'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('import')}
          >
            Import/Export
          </button>
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'categories' && <CategoryGroupSettings onClose={onClose} />}
        {activeTab === 'tags' && <TagSettings onClose={onClose} />}
        {activeTab === 'recurring' && <RecurringExpenses onClose={onClose} />}
        {activeTab === 'import' && <ImportSettings onClose={onClose} />}
      </div>
    </div>
  );
};

export default ExpenseSettings;
