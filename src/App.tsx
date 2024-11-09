import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { useNotifications } from './hooks/useNotifications';
import Navbar from './components/Navbar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Settlement from './components/Settlement';

const App = () => {
  const { currentUser } = useUserStore();
  
  // Initialize notifications
  useNotifications();

  // Request notification permission when app loads
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'denied') {
          console.warn('Notification permission denied');
        }
      });
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-4">AA FairShare</h1>
          <p className="text-gray-600 text-center mb-6">Please log in to continue</p>
          {/* Add your login form here */}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ExpenseList />} />
            <Route path="/add" element={<ExpenseForm />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/settlement" element={<Settlement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
