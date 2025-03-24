'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { NavBar } from '@/components/layout/NavBar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      router.push('/signin');
    }
  }, [user, isLoading, isAuthPage, router]);

  if (isLoading && !isAuthPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && <NavBar />}
      <ErrorBoundary
        fallback={({ error }) => (
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="mt-2">{error.message}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}
      >
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
