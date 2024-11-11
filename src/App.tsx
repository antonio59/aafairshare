import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useExpenseStore } from './store/expenseStore';
import { useUserStore } from './store/userStore';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { clearAuthCache, validateAuthToken } from './utils/authUtils';
import Navbar from './components/Navbar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Settlement from './components/Settlement';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import type { User } from './types';

// Global Authentication Wrapper
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const { setCurrentUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Clear any stale auth cache
        await clearAuthCache();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser) {
            console.log('No authenticated user');
            setCurrentUser(null);
            navigate('/login', { replace: true });
            setIsAuthChecked(true);
            return;
          }

          try {
            // Validate token
            const isValidToken = await validateAuthToken();
            if (!isValidToken) {
              console.log('Invalid token');
              setCurrentUser(null);
              navigate('/login', { replace: true });
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

            setCurrentUser(newUser);
            setIsAuthChecked(true);
          } catch (error) {
            console.error('Authentication validation error:', error);
            await clearAuthCache();
            setCurrentUser(null);
            navigate('/login', { replace: true });
            setIsAuthChecked(true);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Initial auth setup failed:', error);
        setCurrentUser(null);
        navigate('/login', { replace: true });
        setIsAuthChecked(true);
      }
    };

    initAuth();
  }, [setCurrentUser, navigate]);

  // Show loading state while checking auth
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
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  );
}

export default App;
