import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, _LogIn, LogOut, User, _Menu, _X } from 'lucide-react';
import { useAuth } from '../../../core/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const _months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Header({ onNewExpense }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, signOut, profile } = useAuth();
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSignOut = async () => {
    try {
      const { success, message } = await signOut();
      if (success) {
        setShowProfileMenu(false);
        navigate('/auth');
      } else {
        console.error('Sign out failed:', message);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const _toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  const closeMenu = () => {
    setShowMenu(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  };
  
  return (
    <header className="bg-white py-4 px-4 sm:px-6 shadow-sm sticky top-0 z-10" role="banner">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-rose-600 hover:text-rose-700 transition-colors" aria-label="AAFairShare Home">AAFairShare</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onNewExpense}
                  className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  aria-label="Add new expense"
                >
                  <PlusCircle size={18} className="mr-1" aria-hidden="true" />
                  <span>New</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={toggleMenu}
                    className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 rounded-full"
                    aria-haspopup="true"
                    aria-expanded={showMenu}
                    aria-label="User menu"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <User size={18} className="text-rose-600" aria-hidden="true" />
                    </div>
                  </button>
                  
                  {showMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                      onKeyDown={handleKeyDown}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{profile?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={closeMenu}
                      >
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          closeMenu();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        <span className="flex items-center">
                          <LogOut size={16} className="mr-2" aria-hidden="true" />
                          Sign Out
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
                aria-label="Sign in"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}