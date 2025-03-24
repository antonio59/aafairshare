'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TopNavbar } from './TopNavbar';

import type { ReactNode } from 'react';

import { createStandardBrowserClient } from '@/utils/supabase-client';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for auth pages that should never show the layout
  const isAuthPage = pathname?.includes('/signin') || 
                     pathname?.includes('/signup') || 
                     pathname?.includes('/reset-password');
  
  // Check authentication status on client side and redirect if needed
  useEffect(() => {
    async function checkAuth() {
      try {
        setIsLoading(true);
        const supabase = createStandardBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        const isAuth = !!session;
        setIsAuthenticated(isAuth);
        
        // Handle redirects - implemented here rather than just in middleware for better reliability
        if (!isAuth && !isAuthPage && pathname !== '/') {
          // Not authenticated and not on auth page - redirect to signin
          router.push(`/signin?redirect=${encodeURIComponent(pathname || '')}`);
        } else if (isAuth && isAuthPage) {
          // Already authenticated but on auth page - redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        
        // On error, redirect to signin page for safety
        if (!isAuthPage) {
          router.push('/signin');
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [pathname, isAuthPage, router]);
  
  // Don't show layout for auth pages or if not authenticated
  if (isAuthPage || isAuthenticated === false) {
    return <>{children}</>;
  }
  
  // Show loading indicator while checking auth
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show full layout for authenticated users
  return (
    <div className="app-container">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <TopNavbar />
      <main id="main-content" className="main-content">
        {children}
      </main>
    </div>
  );
}
