import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { currentUser, setCurrentUser } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        console.log('No authenticated user');
        setCurrentUser(null);
        setIsAuthChecked(true);
        return;
      }

      try {
        // Get a fresh ID token
        await firebaseUser.getIdToken(true);
        
        // Create or update user in store if needed
        if (!currentUser || currentUser.id !== firebaseUser.uid) {
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
          setCurrentUser(newUser);
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        setCurrentUser(null);
      } finally {
        setIsAuthChecked(true);
      }
    });

    // Cleanup subscription
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
  if (!auth.currentUser || !currentUser) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
