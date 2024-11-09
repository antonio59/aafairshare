import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './store/userStore';
import { useNotifications } from './hooks/useNotifications';
import Navbar from './components/Navbar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Settlement from './components/Settlement';
import { AlertCircle } from 'lucide-react';

const App = () => {
  const { currentUser, login, error } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    login(email, password);
    setIsLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">AA FairShare</h1>
            <p className="mt-2 text-gray-600">Track and split expenses with ease</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Default users for testing:
              </p>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p>andypamo@gmail.com / 1234</p>
                <p>antoniojsmith@protonmail.com / 1234</p>
              </div>
            </div>
          </div>
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
