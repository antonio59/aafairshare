import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('ProtectedRoute');

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, refreshSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  useEffect(() => {
    const MAX_REFRESH_ATTEMPTS = 3;
    const handleSessionRefresh = async () => {
      if (!user && !isRefreshing && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
        setIsRefreshing(true);
        setRefreshAttempts(prev => prev + 1);
        
        try {
          await refreshSession();
          logger.info('Session successfully restored');
        } catch (error) {
          logger.error('Session restoration failed:', error);
          // Immediately redirect to login on first failure
          navigate('/login', { state: { from: location }, replace: true });
        } finally {
          setIsRefreshing(false);
        }
      } else if (!user && refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        // Redirect to login if max attempts reached
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    handleSessionRefresh();
  }, [user, isRefreshing, refreshAttempts, location, navigate, refreshSession]);

  // Only show loading state if we have a user or are in the first refresh attempt
  if ((loading || isRefreshing) && (user || refreshAttempts === 0)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}