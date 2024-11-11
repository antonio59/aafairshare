import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const { initializeStore } = useExpenseStore();
  const { currentUser, setCurrentUser } = useUserStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setIsAuthChecked(true);
      
      if (!user) {
        setCurrentUser(null);
        setIsInitializing(false);
        return;
      }

      try {
        // Initialize store only after successful authentication
        await initializeStore();
      } catch (error) {
        console.error('Failed to initialize store:', error);
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser, initializeStore]);

  // Show loading state while checking auth and initializing
  if (!isAuthChecked || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
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
    </Router>
  );
}

export default App;
