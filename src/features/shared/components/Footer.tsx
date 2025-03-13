import React from 'react';
import { Home, Receipt, Calculator, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Simplified mobile navigation - only essential items
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, path: '/expenses' },
    { id: 'settlements', label: 'Settlements', icon: Calculator, path: '/settlements' },
    { id: 'profile', label: 'Profile', icon: User, path: '/settings' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-10">
      <nav className="max-w-6xl mx-auto">
        <ul className="flex justify-around items-center">
          {tabs.map(tab => (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => navigate(tab.path)}
                className={`w-full flex flex-col items-center py-2 px-1 ${
                  isActive(tab.path) ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={20} className={isActive(tab.path) ? 'animate-pulse' : ''} />
                <span className="text-xs mt-1">{tab.label}</span>
                {isActive(tab.path) && (
                  <div className="h-1 w-5 bg-rose-500 rounded-full mt-1"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}