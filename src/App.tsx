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
import { AlertTriangle } from 'lucide-react';

const App = () => {
  const { processRecurringExpenses, initializeStore, initialized, error } = useExpenseStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (initialized && !error) {
      processRecurringExpenses();
      const interval = setInterval(processRecurringExpenses, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [initialized, processRecurringExpenses, error]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load App</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                We're having trouble connecting to our servers. This might be because:
              </p>
              
              <ul className="text-sm text-left text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Your internet connection is unstable
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Our servers might be temporarily down
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  You might need to clear your browser cache
                </li>
              </ul>

              <div className="bg-red-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-red-700">
                  Error details: {error}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => {
                  indexedDB.deleteDatabase('firebaseLocalStorageDb');
                  window.location.reload();
                }}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Cache and Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Compact Header */}
          <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-xl font-bold text-gray-800">AA FairShare</h1>
                <UserSelect />
              </div>
            </div>
          </header>

          {/* Adjusted Main Content */}
          <main className="pt-20 pb-20">
            <div className="container mx-auto px-4">
              <Routes>
                <Route path="/" element={<ExpenseList />} />
                <Route path="/add" element={<ExpenseForm />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settle" element={<Settlement />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>

          {/* Enhanced Bottom Navigation */}
          <Navbar />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
