// @/components/navbar.tsx
'use client';

import { Home, PlusCircle, BarChart3, Settings as SettingsIcon, Wallet, LogOut } from 'lucide-react'; // Renamed to SettingsIcon
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '../store/userStore';
import { useState } from 'react';
import Settings from './Settings'; // Ensure this is the only import for Settings

const Navbar = () => {
  const pathname = usePathname(); // Use Next.js's usePathname
  const router = useRouter(); // Use Next.js's useRouter
  const { currentUser, logout } = useUserStore();
  const [showSettings, setShowSettings] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Primary navigation items (shown in bottom bar)
  const primaryNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/settlement', icon: Wallet, label: 'Settlement' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleLogout = () => {
    try {
      logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSettings(!showSettings);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AA FairShare</h1>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {currentUser?.role === 'partner1' ? 'Andres' : 'Antonio'}
                </span>
                <span className="text-xs text-gray-500">
                  {currentUser?.role === 'partner1' ? 'Partner 1' : 'Partner 2'}
                </span>
              </div>
              <button
                onClick={handleSettingsClick}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  showSettings
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
                aria-label="Settings"
              >
                <SettingsIcon className="w-5 h-5" /> {/* Updated to SettingsIcon */}
                <span className="text-sm font-medium hidden sm:inline">
                  Settings
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg白色 border-t border-gray-200 z-50 pb-safe">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-4 gap-1 py-2">
            {primaryNavItems.map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                    active 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  aria-label={label}
                >
                  <div 
                    className={`p-2 rounded-lg transition-colors ${
                      active ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium mt-1 text-center leading-tight">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowSettings(false)}
            ></div>

            {/* Settings panel */}
            <div className="inline-block w-full max-w-5xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="relative">
                <button
                  onClick={() => setShowSettings(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <Settings /> {/* Updated usage */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;