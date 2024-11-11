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
  const currentUser = useUserStore(state => state.currentUser);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthChecked(true);
      if (!user && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      initializeStore();
    }
  }, [initializeStore, currentUser]);

  // Show loading state while checking auth
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
