import React from 'react';
import { Home, PlusCircle, BarChart3, Settings, Wallet, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className={`flex flex-col items-center p-2 ${
              isActive('/') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/add"
            className={`flex flex-col items-center p-2 ${
              isActive('/add') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Add</span>
          </Link>

          <Link
            to="/settle"
            className={`flex flex-col items-center p-2 ${
              isActive('/settle') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Wallet className="w-6 h-6" />
            <span className="text-xs mt-1">Settle</span>
          </Link>

          <Link
            to="/analytics"
            className={`flex flex-col items-center p-2 ${
              isActive('/analytics') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>

          <Link
            to="/budget"
            className={`flex flex-col items-center p-2 ${
              isActive('/budget') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Target className="w-6 h-6" />
            <span className="text-xs mt-1">Budget</span>
          </Link>

          <Link
            to="/settings"
            className={`flex flex-col items-center p-2 ${
              isActive('/settings') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;