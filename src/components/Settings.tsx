import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Bell, FileText, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import AccountSettings from './Settings/AccountSettings';
import ExpenseSettings from './Settings/ExpenseSettings';
import NotificationsSettings from './Settings/NotificationsSettings';
import DocumentationSettings from './Settings/DocumentationSettings';

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  // Set initial tab based on URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && tabs.some(tab => tab.id === hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/settings#${tabId}`, { replace: true });
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'expense', label: 'Expense', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'documentation', label: 'Documentation', icon: <FileText className="w-5 h-5" /> },
  ];

  const getTabHeading = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? `${tab.label} Settings` : 'Settings';
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'account':
        return 'Manage your account preferences and settings';
      case 'expense':
        return 'Manage categories and their groups, tags, and recurring expenses';
      case 'notifications':
        return 'Customize your notification preferences';
      case 'documentation':
        return 'Learn how to use AA FairShare';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'expense':
        return <ExpenseSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'documentation':
        return <DocumentationSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">{getTabHeading()}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="-mb-px flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label} Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {getTabDescription()}
            </p>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
