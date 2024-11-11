import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useExpenseStore } from './store/expenseStore';
import { useUserStore } from './store/userStore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Settlement from './components/Settlement';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { clearAuthCache } from './utils/authUtils';

// AuthWrapper component to handle authentication state
const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { setCurrentUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        // Clear any stale auth state
        await clearAuthCache();
      } catch (error) {
        console.error('Error clearing auth cache:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email);
      setIsAuthChecked(true);

      if (!user) {
        console.log('No authenticated user, redirecting to login');
        setCurrentUser(null);
        navigate('/login', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser, navigate]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  const { initializeStore } = useExpenseStore();
  const currentUser = useUserStore(state => state.currentUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      if (currentUser && auth.currentUser) {
        try {
          await initializeStore();
        } catch (error) {
          console.error('Failed to initialize store:', error);
          // If store initialization fails, clear auth state
          await clearAuthCache();
        }
      }
      setIsInitializing(false);
    };

    initApp();
  }, [currentUser, initializeStore]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <AuthWrapper>
        <div className="min-h-screen bg-gray-50">
          {currentUser && <Navbar />}
          <main className={currentUser ? "pt-16 pb-20" : ""}>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={
                currentUser ? <Navigate to="/" replace /> : <Login />
              } />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <ExpenseList />
                </ProtectedRoute>
              } />
              
              <Route path="/add" element={
                <ProtectedRoute>
                  <ExpenseForm />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/settlement" element={
                <ProtectedRoute>
                  <Settlement />
                </ProtectedRoute>
              } />

              {/* Catch-all route - redirect to login if not authenticated, home if authenticated */}
              <Route path="*" element={
                currentUser ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
              } />
            </Routes>
          </main>
        </div>
      </AuthWrapper>
    </Router>
  );
}

export default App;
