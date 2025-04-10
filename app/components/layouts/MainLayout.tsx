import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from '@remix-run/react';
import { useAuth } from '~/contexts/AuthContext';
import { Home, BarChart2, Settings, RefreshCw, PoundSterling, LogOut, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { logout, currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return 'AA';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 md:h-screen md:sticky md:top-0" aria-label="Main navigation">
        {/* Sidebar Title Link */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
            AAFairShare
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/settlement"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/settlement') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <PoundSterling className="h-5 w-5 mr-3" />
                Settlement
              </Link>
            </li>
            <li>
              <Link
                to="/analytics"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/analytics') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/recurring"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/recurring') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <RefreshCw className="h-5 w-5 mr-3" />
                Recurring
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/settings') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={userProfile?.photoURL || currentUser?.photoURL || undefined} alt={userProfile?.username || currentUser?.displayName || "User"} />
                <AvatarFallback>{getInitials(userProfile?.username || currentUser?.displayName, currentUser?.email)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {userProfile?.username || currentUser?.displayName || "User"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50" onClick={closeMobileMenu}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-800 px-4">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white" onClick={closeMobileMenu}>
                AAFairShare
              </Link>
              <button onClick={closeMobileMenu} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="py-4">
              <ul className="space-y-1 px-2">
                <li>
                  <Link
                    to="/"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                    onClick={closeMobileMenu}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settlement"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/settlement') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                    onClick={closeMobileMenu}
                  >
                    <PoundSterling className="h-5 w-5 mr-3" />
                    Settlement
                  </Link>
                </li>
                <li>
                  <Link
                    to="/analytics"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/analytics') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                    onClick={closeMobileMenu}
                  >
                    <BarChart2 className="h-5 w-5 mr-3" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/recurring"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/recurring') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                    onClick={closeMobileMenu}
                  >
                    <RefreshCw className="h-5 w-5 mr-3" />
                    Recurring
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className={`flex items-center px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${location.pathname.startsWith('/settings') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                </li>
                <li className="mt-4 px-4">
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      handleLogout();
                    }}
                    className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full px-4">
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Header Title (Mobile) */}
            <div className="md:hidden">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                AAFairShare
              </Link>
            </div>

            {/* User Menu (Mobile only) */}
            <div className="flex items-center md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.photoURL || currentUser?.photoURL || undefined} alt={userProfile?.username || currentUser?.displayName || "User"} />
                    <AvatarFallback>{getInitials(userProfile?.username || currentUser?.displayName, currentUser?.email)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
