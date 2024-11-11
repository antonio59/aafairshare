import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const currentUser = useUserStore(state => state.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthChecked(true);
      
      if (!user) {
        console.log('Protected route: No authenticated user');
        setIsAuthenticated(false);
        // Force redirect to login
        window.location.href = '/login';
        return;
      }

      // Verify we have both Firebase auth and store user
      if (!currentUser) {
        console.log('Protected route: No store user');
        setIsAuthenticated(false);
        // Force redirect to login
        window.location.href = '/login';
        return;
      }

      setIsAuthenticated(true);
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !currentUser || !auth.currentUser) {
    console.log('Protected route: Redirecting to login');
    // Save the attempted URL for redirecting back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Additional check for Firebase token
  const checkToken = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.log('Protected route: No valid token');
        window.location.href = '/login';
        return null;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      window.location.href = '/login';
      return null;
    }
  };

  // Verify token on mount and periodically
  useEffect(() => {
    if (isAuthenticated) {
      const tokenCheck = setInterval(checkToken, 60000); // Check token every minute
      checkToken(); // Initial check
      return () => clearInterval(tokenCheck);
    }
  }, [isAuthenticated]);

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
