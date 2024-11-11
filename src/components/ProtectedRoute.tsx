import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { clearAuthCache } from '../utils/authUtils';
import type { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const { currentUser, setCurrentUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clear any stale auth state
        await clearAuthCache();
      } catch (error) {
        console.error('Error clearing auth cache:', error);
      }
    };

    checkAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthChecked(true);
      
      if (!user) {
        console.log('No authenticated user in ProtectedRoute');
        setIsAuthenticated(false);
        setCurrentUser(null);
        return;
      }

      try {
        // Verify token
        const token = await user.getIdToken(true);
        console.log('Token verified for user:', user.email);

        // Ensure user exists in store
        if (!currentUser) {
          const newUser: User = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || '',
            email: user.email || '',
            role: (user.email?.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2') as 'partner1' | 'partner2',
            preferences: {
              currency: 'GBP',
              favicon: '',
              notifications: {
                overBudget: true,
                monthlyReminder: true,
                monthEndReminder: true,
                monthlyAnalytics: true,
              },
            },
          };
          setCurrentUser(newUser);
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        await clearAuthCache();
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser, setCurrentUser]);

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !currentUser || !auth.currentUser) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
