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
  const { processRecurringExpenses, initializeStore, initialized } = useExpenseStore();

  useEffect(() => {
    // Initialize the store when the app starts
    initializeStore();
  }, [initializeStore]);

  useEffect(() => {
    if (initialized) {
      // Process recurring expenses daily
      processRecurringExpenses();
      const interval = setInterval(processRecurringExpenses, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [initialized, processRecurringExpenses]);

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
