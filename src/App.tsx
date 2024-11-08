import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserSelect from './components/UserSelect';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Settlement from './components/Settlement';
import Budget from './components/Budget';
import { useExpenseStore } from './store/expenseStore';
import ErrorBoundary from './utils/errorBoundary';

const App = () => {
  const { processRecurringExpenses, initializeStore, initialized, error } = useExpenseStore();

  useEffect(() => {
    // Initialize the store when the app starts
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (initialized && !error) {
      // Process recurring expenses daily
      processRecurringExpenses();
      const interval = setInterval(processRecurringExpenses, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [initialized, processRecurringExpenses, error]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading App</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Fixed Header */}
          <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
            <div className="container mx-auto px-4">
              {/* User Selection Bar */}
              <UserSelect />
              {/* App Title */}
              <div className="py-4">
                <h1 className="text-2xl font-bold text-center text-gray-800">AA FairShare</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-32 pb-20">
            <Routes>
              <Route path="/" element={<ExpenseList />} />
              <Route path="/add" element={<ExpenseForm />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settle" element={<Settlement />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          {/* Fixed Bottom Navigation */}
          <Navbar />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
