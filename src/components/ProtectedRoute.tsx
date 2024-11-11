import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { clearAuthCache, validateAuthToken } from '../utils/authUtils';
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
    const checkAuthState = async () => {
      try {
        // Clear any stale auth cache
        await clearAuthCache();

        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser) {
            console.log('No authenticated user');
            setIsAuthenticated(false);
            setCurrentUser(null);
            setIsAuthChecked(true);
            return;
          }

          try {
            // Validate token
            const isValidToken = await validateAuthToken();
            if (!isValidToken) {
              console.log('Invalid token');
              setIsAuthenticated(false);
              setCurrentUser(null);
              setIsAuthChecked(true);
              return;
            }

            // Create or update user in store
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
              email: firebaseUser.email || '',
              role: (firebaseUser.email?.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2') as 'partner1' | 'partner2',
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

            // Update current user if not already set or different
            if (!currentUser || currentUser.id !== newUser.id) {
              setCurrentUser(newUser);
            }

            setIsAuthenticated(true);
            setIsAuthChecked(true);
          } catch (error) {
            console.error('Authentication validation error:', error);
            await clearAuthCache();
            setIsAuthenticated(false);
            setCurrentUser(null);
            setIsAuthChecked(true);
          }
        });

        // Cleanup subscription
        return () => unsubscribe();
      } catch (error) {
        console.error('Initial auth check failed:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAuthChecked(true);
      }
    };

    checkAuthState();
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
