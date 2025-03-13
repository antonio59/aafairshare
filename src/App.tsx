import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './features/shared/components/Header';
import Footer from './features/shared/components/Footer';
import MonthlyExpenses from './features/expenses/components/MonthlyExpenses';
import NewExpenseModal from './features/expenses/components/NewExpenseModal';
import ExpenseDetailPage from './features/expenses/components/ExpenseDetailPage';
import { SettlementsPage } from './features/settlements';
import AnalyticsPage from './features/analytics/components/AnalyticsPage';
import Dashboard from './features/analytics/components/Dashboard';
import SettingsPage from './features/settings/components/SettingsPage';
import CategoryManagementPage from './features/settings/components/CategoryManagementPage';
import AuthPage from './features/auth/components/AuthPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { AuthProvider, useAuth } from './core/contexts/AuthContext';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import TestAuth from './features/auth/components/TestAuth';

// Layout component to handle conditional rendering of Header and Footer
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthRoute = ['/login', '/signup', '/auth'].includes(location.pathname);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const { refreshSession } = useAuth();

  const handleNewExpense = () => {
    console.log('DEBUG: handleNewExpense called');
    setShowNewExpenseModal(true);
  };

  // Listen for online/offline events
  useEffect(() => {
    const handleOffline = () => {
      console.log('DEBUG: Network is offline');
      setNetworkError(true);
    };

    const handleOnline = async () => {
      console.log('DEBUG: Network is back online, attempting to refresh session');
      setNetworkError(false);
      
      try {
        // Try to refresh the session when we're back online
        await refreshSession();
      } catch (error) {
        console.error('DEBUG: Error refreshing session after reconnect:', error);
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshSession]);

  return (
    <div className={`min-h-screen ${!isAuthRoute ? 'bg-gray-50' : ''}`}>
      {!isAuthRoute && <Header onNewExpense={handleNewExpense} />}
      
      {/* Network error message */}
      {networkError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 sticky top-0 z-50">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Network connection lost</p>
              <p className="text-sm">Check your internet connection and try again.</p>
            </div>
          </div>
        </div>
      )}
      
      <main className={!isAuthRoute ? 'max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24' : ''}>
        {children}
      </main>
      {!isAuthRoute && <Footer />}
      {showNewExpenseModal && (
        <NewExpenseModal
          isOpen={showNewExpenseModal}
          onClose={() => setShowNewExpenseModal(false)}
          onExpenseCreated={() => {
            setShowNewExpenseModal(false);
          }}
        />
      )}
    </div>
  );
};

interface AppProps {}

export const App: React.FC<AppProps> = () => {
  console.log('DEBUG: App component rendering');
  
  const [_isMobile, setIsMobile] = useState<boolean>(false);

  // Check screen size on load and resize
  useEffect(() => {
    console.log('DEBUG: App useEffect for screen size detection');
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initialize
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handler for view more button in expenses component
  const handleViewAllExpenses = () => {
    console.log('DEBUG: handleViewAllExpenses called');
    // Navigate to a complete expenses list view when implemented
    // For now, this is a no-op
  };

  console.log('DEBUG: App rendering with providers and router');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ 
          v7_relativeSplatPath: true,
          v7_startTransition: true 
        }}>
          <AppLayout>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <MonthlyExpenses 
                    refreshTrigger={0} 
                    onNewExpense={() => {}} 
                    onViewMore={handleViewAllExpenses} 
                  />
                </ProtectedRoute>
              } />
              <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetailPage /></ProtectedRoute>} />
              <Route path="/settlements" element={
                <ProtectedRoute>
                  <SettlementsPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><CategoryManagementPage /></ProtectedRoute>} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="/testauth" element={<TestAuth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};