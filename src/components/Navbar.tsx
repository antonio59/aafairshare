import { Home, PlusCircle, BarChart3, Settings, Wallet, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useUserStore();

  const isActive = (path: string) => location.pathname === path;

  // Primary navigation items (shown in bottom bar)
  const primaryNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
    { path: '/settlement', icon: Wallet, label: 'Settlement' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  // Secondary navigation items (shown in dropdown/menu)
  const secondaryNavItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    try {
      logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-4 gap-1 py-2">
            {primaryNavItems.map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
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

      {/* Secondary Navigation (Shown in Header Dropdown) */}
      <div className="fixed top-16 right-4 z-50">
        <div className="flex gap-2">
          {secondaryNavItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                } shadow-sm border border-gray-200`}
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Padding */}
      <div className="pb-[80px] pt-[64px]" />
    </>
  );
};

export default Navbar;
