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
  const location = useLocation();
  const currentUser = useUserStore(state => state.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthChecked(true);
      if (!user) {
        console.log('No authenticated user, redirecting to login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser || !auth.currentUser) {
    console.log('Protected route: redirecting to login');
    // Save the attempted URL for redirecting back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
