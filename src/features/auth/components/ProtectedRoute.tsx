import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, profile, refreshSession } = useAuth();
  const location = useLocation();
  const [showProfileTimeout, setShowProfileTimeout] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  // Add debug logging
  useEffect(() => {
    console.log('ProtectedRoute: Component mounted');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Profile:', profile);
    
    return () => {
      console.log('ProtectedRoute: Component unmounted');
    };
  }, [user, loading, profile]);

  // Show profile completion prompt after 5 seconds if profile is incomplete
  useEffect(() => {
    if (user && !loading && !profile?.name) {
      const timer = setTimeout(() => {
        setShowProfileTimeout(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, profile]);
  
  // Add a global error handler for fetch errors to detect auth issues
  useEffect(() => {
    const handleGlobalError = async (event: ErrorEvent) => {
      // Check if this is a fetch error and we're not already refreshing
      if (event.error?.message?.includes('fetch') && !isRefreshing && refreshAttempts < 3) {
        console.log('ProtectedRoute: Detected fetch error, attempting session refresh');
        setIsRefreshing(true);
        setRefreshAttempts(prev => prev + 1);
        
        try {
          const success = await refreshSession();
          console.log('ProtectedRoute: Session refresh result:', success);
        } catch (err) {
          console.error('ProtectedRoute: Error during refresh:', err);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [refreshSession, isRefreshing, refreshAttempts]);

  // If auth is still loading or we're refreshing, show a loading indicator
  if (loading || isRefreshing) {
    console.log('ProtectedRoute: Loading auth state or refreshing session...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to auth page
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile is incomplete and timeout has passed, redirect to settings
  if (showProfileTimeout && !profile?.name) {
    console.log('ProtectedRoute: Incomplete profile, redirecting to settings');
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Please take a moment to complete your profile. This will help us provide a better experience.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowProfileTimeout(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Later
            </button>
            <Navigate to="/settings" state={{ from: location }} replace />
          </div>
        </div>
      </div>
    );
  }

  // If all checks pass, render the protected content
  console.log('ProtectedRoute: Rendering protected content');
  return children;
} 