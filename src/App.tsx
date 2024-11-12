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

// Separate AuthCheck component to handle auth state
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useUserStore();
  const { initializeStore } = useExpenseStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async (firebaseUser: any) => {
      try {
        if (!firebaseUser) {
          setCurrentUser(null);
          navigate('/login', { replace: true });
          return;
        }

        const isValidToken = await validateAuthToken();
        if (!isValidToken) {
          setCurrentUser(null);
          navigate('/login', { replace: true });
          return;
        }

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
        await initializeStore();
      } catch (error) {
        console.error('Auth check failed:', error);
        await clearAuthCache();
        setCurrentUser(null);
        navigate('/login', { replace: true });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await handleAuth(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setCurrentUser, navigate, initializeStore]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main App component
function App() {
  const currentUser = useUserStore(state => state.currentUser);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AuthCheck>
          {currentUser && <Navbar />}
          <main className={currentUser ? "pt-16 pb-20" : ""}>
            <Routes>
              {/* Public route */}
              <Route 
                path="/login" 
                element={currentUser ? <Navigate to="/" replace /> : <Login />} 
              />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <ExpenseList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add" 
                element={
                  <ProtectedRoute>
                    <ExpenseForm />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settlement" 
                element={
                  <ProtectedRoute>
                    <Settlement />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all route */}
              <Route 
                path="*" 
                element={currentUser ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} 
              />
            </Routes>
          </main>
        </AuthCheck>
      </div>
    </Router>
  );
}

export default App;
