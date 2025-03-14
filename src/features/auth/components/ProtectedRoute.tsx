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
          if (error?.name === 'AuthSessionMissingError') {
            logger.warn('No active session found, redirecting to login');
          } else {
            logger.error('Session restoration failed:', error);
          }
          
          if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            navigate('/login', { state: { from: location }, replace: true });
          }
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    handleSessionRefresh();
  }, [user, isRefreshing, refreshAttempts, location, navigate, refreshSession]);

  if (loading || isRefreshing) {
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