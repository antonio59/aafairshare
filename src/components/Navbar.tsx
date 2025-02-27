// @/components/navbar.tsx
'use client';

import { Home, PlusCircle, BarChart3, Settings as SettingsIcon, Wallet, LogOut } from 'lucide-react'; // Renamed to SettingsIcon
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useState } from 'react';
import Settings from './Settings'; // Ensure this is the only import for Settings

export function Navbar() {
  const pathname = usePathname(); // Use Next.js's usePathname
  const router = useRouter(); // Use Next.js's useRouter
  const { user, logout } = useUserStore();
  const [showSettings, setShowSettings] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Primary navigation items (shown in bottom bar)
  const primaryNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/expenses', icon: PlusCircle, label: 'Add' },
    { path: '/settlements', icon: Wallet, label: 'Settlement' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSettings(!showSettings);
  };

  if (!user.isAuthenticated) {
    return null; // Don't show navbar for unauthenticated users
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AA FairShare</h1>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name || user.email}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.role === 'partner1' ? 'Partner 1' : 'Partner 2'}
                </span>
              </div>
              <button
                onClick={handleSettingsClick}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  showSettings
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-300'
                }`}
                aria-label="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  Settings
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 pb-safe">
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
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  aria-label={label}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;