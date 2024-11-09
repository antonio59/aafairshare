import React from 'react';
import { Home, PlusCircle, BarChart3, Settings, Wallet, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/settle', icon: Wallet, label: 'Settle' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/budget', icon: Target, label: 'Budget' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-6 py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center p-1 transition-colors ${
                  active 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  active ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
