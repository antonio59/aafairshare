'use client';

import { 
  Home, 
  PoundSterling, 
  Landmark, 
  LogOut, 
  Menu, 
  Settings, 
  User, 
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => 
    pathname === path || pathname?.startsWith(`${path}/`);
    
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="flex-1 flex items-center">
          <Link href="/" className="navbar-logo">
            <Landmark className="text-primary" />
            <span>FairShare</span>
          </Link>
          
          <nav className="ml-8 hidden md:flex items-center space-x-2">
            <Link
              href="/dashboard"
              className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <Home className="mr-1" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/expenses"
              className={`navbar-link ${isActive('/expenses') ? 'active' : ''}`}
            >
              <PoundSterling className="mr-1" />
              <span>Expenses</span>
            </Link>
            
            <Link
              href="/settlements"
              className={`navbar-link ${isActive('/settlements') ? 'active' : ''}`}
            >
              <Landmark className="mr-1" />
              <span>Settlements</span>
            </Link>
          </nav>
        </div>
        
        <div className="navbar-actions">
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button 
                className="user-menu-button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-label="User menu"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                <User className="h-6 w-6" />
              </button>
              
              {/* Profile dropdown menu */}
              <div 
                className={`absolute right-0 mt-2 w-48 py-1 bg-white rounded-md shadow-lg z-50 border border-gray-200 transition-all duration-150 ease-in-out ${
                  profileMenuOpen 
                    ? 'opacity-100 translate-y-0 pointer-events-auto' 
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </div>
                </Link>
                <button
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    handleLogout();
                    setProfileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign out</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/signin"
              className="btn btn-primary"
            >
              Log in
            </Link>
          )}
          
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <div className="p-4 space-y-4">
            <Link
              href="/dashboard"
              className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/expenses"
              className={`sidebar-link ${isActive('/expenses') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <PoundSterling />
              <span>Expenses</span>
            </Link>
            
            <Link
              href="/settlements"
              className={`sidebar-link ${isActive('/settlements') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Landmark />
              <span>Settlements</span>
            </Link>
            
            {user && (
              <>
                <Link
                  href="/settings"
                  className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings />
                  <span>Settings</span>
                </Link>
                
                <button
                  className="sidebar-link text-[#ef4444]"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
