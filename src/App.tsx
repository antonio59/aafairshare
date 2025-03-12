import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Header,
  Footer,
  MonthlyExpenses,
  NewExpenseModal,
  ExpenseDetailPage,
  SettlementsPage,
  AnalyticsPage,
  SettingsPage,
  CategoryManagementPage,
  AuthPage,
  ProtectedRoute
} from '@/features';
import { AuthProvider } from '@core/contexts/AuthContext';
import { CurrencyProvider } from '@core/contexts/CurrencyContext';
import { ErrorBoundary } from '@core/components/ErrorBoundary';

interface AppProps {}

export const App: React.FC<AppProps> = () => {
  console.log('DEBUG: App component rendering');
  
  const [showNewExpenseModal, setShowNewExpenseModal] = useState<boolean>(false);
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

  const handleNewExpense = () => {
    console.log('DEBUG: handleNewExpense called');
    setShowNewExpenseModal(true);
  };
  
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
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <div>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <MonthlyExpenses 
                          onViewMore={handleViewAllExpenses} 
                          refreshTrigger={expenseRefreshTrigger}
                          onNewExpense={handleNewExpense}
                        />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/settlements/*" element={
                  <ProtectedRoute>
                    <div>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <SettlementsPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics/*" element={
                  <ProtectedRoute>
                    <>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <AnalyticsPage />
                      </main>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />
                
                <Route path="/settings/*" element={
                  <ProtectedRoute>
                    <>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <SettingsPage />
                      </main>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />
                
                <Route path="/categories/*" element={
                  <ProtectedRoute>
                    <>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <CategoryManagementPage />
                      </main>
                      <Footer />
                    </>
                  </ProtectedRoute>
                } />
                
                <Route path="/expenses/edit/:id" element={
                  <ProtectedRoute>
                    <div>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <ExpenseDetailPage isEditMode={true} />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="/expenses/:id" element={
                  <ProtectedRoute>
                    <div>
                      <Header onNewExpense={handleNewExpense} />
                      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
                        <ExpenseDetailPage />
                      </main>
                      <Footer />
                    </div>
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
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
          </Router>
        </CurrencyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};