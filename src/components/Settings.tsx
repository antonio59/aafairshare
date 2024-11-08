import React, { useState } from 'react';
import AccountSettings from './Settings/AccountSettings';
import ExpenseSettings from './Settings/ExpenseSettings';
import NotificationsSettings from './Settings/NotificationsSettings';
import DocumentationSettings from './Settings/DocumentationSettings';
import ImportSettings from './Settings/ImportSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'expense', label: 'Expense' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'import', label: 'Import' },
    { id: 'documentation', label: 'Documentation' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'expense':
        return <ExpenseSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'import':
        return <ImportSettings />;
      case 'documentation':
        return <DocumentationSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Settings;