import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { currentUser, setCurrentUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthChecked(true);
      
      if (firebaseUser) {
        setIsAuthenticated(true);
        
        // If we have a Firebase user but no current user in store,
        // create one based on Firebase data
        if (!currentUser) {
          const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            email: firebaseUser.email || '',
            role: 'partner1', // Default to partner1, can be updated in settings
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
          setCurrentUser(user);
        }
      } else {
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
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
