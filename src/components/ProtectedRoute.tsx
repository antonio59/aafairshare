import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const currentUser = useUserStore(state => state.currentUser);
  const isInitialized = useUserStore(state => state.isInitialized);

  // Don't redirect until we know the auth state
  if (!isInitialized) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
