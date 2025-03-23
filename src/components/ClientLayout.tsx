'use client';


import { ErrorBoundary } from './ErrorBoundary';
import NavBar from './NavBar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/signin');
    }
  }, [user, loading, isAuthPage, router]);

  if (loading && !isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && <NavBar />}
      <ErrorBoundary>
        <div className={`container mx-auto px-4 ${isAuthPage ? 'pt-0' : ''}`}>
          {children}
        </div>
      </ErrorBoundary>
    </>
  );
}

export interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </AuthProvider>
  );
}