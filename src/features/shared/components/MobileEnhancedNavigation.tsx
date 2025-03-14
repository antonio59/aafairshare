import React from 'react';
import { Home, FileText, BarChart2, Settings, PlusCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileEnhancedNavigation({ onNewExpense }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/' },
    { id: 'settlements', label: 'Settlements', icon: FileText, path: '/settlements' },
    { id: 'expenses', label: 'Expenses', icon: Home, path: '/expenses' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-10 transition-all duration-300 ease-in-out" role="navigation" aria-label="Mobile navigation">
      <nav className="max-w-6xl mx-auto">
        <ul className="flex justify-around items-center">
          {tabs.map(tab => (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => navigate(tab.path)}
                className={`w-full flex flex-col items-center py-2 px-1 ${
                  isActive(tab.path) ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-label={tab.label}
                aria-current={isActive(tab.path) ? 'page' : undefined}
              >
                <tab.icon size={20} className={isActive(tab.path) ? 'animate-pulse' : ''} aria-hidden="true" />
                <span className="text-xs mt-1">{tab.label}</span>
                {isActive(tab.path) && (
                  <div className="h-1 w-5 bg-rose-500 rounded-full mt-1" aria-hidden="true"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Floating Action Button */}
      <button
        onClick={onNewExpense}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-rose-600 rounded-full shadow-lg flex items-center justify-center hover:bg-rose-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
        aria-label="Add new expense"
      >
        <PlusCircle size={24} className="text-white" aria-hidden="true" />
      </button>
    </div>
  );
}