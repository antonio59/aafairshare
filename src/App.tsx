import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './features/shared/components/Header';
import Footer from './features/shared/components/Footer';
import MonthlyExpenses from './features/expenses/components/MonthlyExpenses';
import NewExpenseModal from './features/expenses/components/NewExpenseModal';
import ExpenseDetailPage from './features/expenses/components/ExpenseDetailPage';
import SettlementsPage from './features/settlements/components/SettlementsPage';
import AnalyticsPage from './features/analytics/components/AnalyticsPage';
import SettingsPage from './features/settings/components/SettingsPage';
import CategoryManagementPage from './features/settings/components/CategoryManagementPage';
import AuthPage from './features/auth/components/AuthPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { AuthProvider } from './core/contexts/AuthContext';
import { CurrencyProvider } from './core/contexts/CurrencyContext';
import { ErrorBoundary } from './core/components/ErrorBoundary';

// Layout component to handle conditional rendering of Header and Footer
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const [showNewExpenseModal, setShowNewExpenseModal] = useState<boolean>(false);
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState<number>(0);

  const handleNewExpense = () => {
    console.log('DEBUG: handleNewExpense called');
    setShowNewExpenseModal(true);
  };

  return (
    <div className={`min-h-screen ${!isAuthPage ? 'bg-gray-50' : ''}`}>
      {!isAuthPage && <Header onNewExpense={handleNewExpense} />}
      <main className={!isAuthPage ? 'max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24' : ''}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
      {showNewExpenseModal && (
        <NewExpenseModal
          isOpen={showNewExpenseModal}
          onClose={() => setShowNewExpenseModal(false)}
          onExpenseCreated={() => {
            setShowNewExpenseModal(false);
            setExpenseRefreshTrigger(prev => prev + 1);
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
  const [expenseRefreshTrigger, setExpenseRefreshTrigger] = useState<number>(0);

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
        <CurrencyProvider>
          <Router future={{ 
            v7_relativeSplatPath: true,
            v7_startTransition: true 
          }}>
            <AppLayout>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <MonthlyExpenses 
                      refreshTrigger={expenseRefreshTrigger} 
                      onNewExpense={() => {}} 
                      onViewMore={handleViewAllExpenses} 
                    />
                  </ProtectedRoute>
                } />
                <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetailPage /></ProtectedRoute>} />
                <Route path="/settlements" element={<ProtectedRoute><SettlementsPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoryManagementPage /></ProtectedRoute>} />
                <Route path="/auth" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </Router>
        </CurrencyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};