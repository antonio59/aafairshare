import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from './store/userStore';
import { supabase } from './supabase';
import { clearAuthCache, validateAuthToken } from './utils/authUtils';
import Navbar from './components/Navbar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import Analytics from './components/Analytics';
import Settlement from './components/Settlement';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import type { User, NotificationPreferences } from './types';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Default notification preferences
const defaultNotificationPreferences: NotificationPreferences = {
  globalEnabled: true,
  overBudget: {
    enabled: true,
    emailEnabled: true,
    inAppEnabled: true,
    dismissedAlerts: []
  },
  monthlyReminder: {
    enabled: true,
    time: '17:00' // Set to 5 PM on last day of month
  },
  settlementNotifications: {
    enabled: true,
    emailEnabled: true,
    inAppEnabled: true
  }
};

// Separate AuthCheck component to handle auth state
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const { setCurrentUser, setInitialized } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const handleAuth = async (session: any) => {
      try {
        if (!session?.user) {
          setCurrentUser(null);
          setInitialized(true);
          return;
        }

        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setCurrentUser(null);
          setInitialized(true);
          return;
        }

        const newUser: User = {
          id: session.user.id,
          name: session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          role: (session.user.email?.toLowerCase() === 'andypamo@gmail.com' ? 'partner1' : 'partner2') as 'partner1' | 'partner2',
          preferences: {
            currency: 'GBP',
            notifications: profile?.notification_preferences || defaultNotificationPreferences
          },
        };

        setCurrentUser(newUser);
        setInitialized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        await clearAuthCache();
        setCurrentUser(null);
        setInitialized(true);
      }
    };

    // Set a loading timeout
    setIsLoading(true);
    timeoutId = setTimeout(() => {
      if (mounted) {
        setIsLoading(false);
      }
    }, 1000); // Show loading for max 1 second

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      await handleAuth(session);
      if (mounted) {
        setIsLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [setCurrentUser, setInitialized]);

  // Only show loading spinner for the first second
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

// Main App component
function App() {
  const currentUser = useUserStore(state => state.currentUser);
  const isInitialized = useUserStore(state => state.isInitialized);

  // Show loading spinner only during initial load and for max 1 second
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <main role="main" className="min-h-screen bg-gray-50">
        {currentUser && <Navbar />}
        <h1 className="sr-only">AAFairShare - Expense Sharing Made Simple</h1>
        <AuthCheck>
          <div className={`${currentUser ? "mt-14 mb-16 px-4" : ""}`}>
            <Routes>
              <Route 
                path="/login" 
                element={currentUser ? <Navigate to="/" replace /> : <Login />} 
              />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <ExpenseList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add" 
                element={
                  <ProtectedRoute>
                    <ExpenseForm />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settlement" 
                element={
                  <ProtectedRoute>
                    <Settlement />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="*" 
                element={currentUser ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} 
              />
            </Routes>
          </div>
        </AuthCheck>
      </main>
    </Router>
  );
}

export default App;
