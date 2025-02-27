import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { initializePerformanceMonitoring } from './utils/performance-monitor';
import { createPersistentStore } from './utils/store-optimizer';
import { useUserStore, type UserState } from './store/userStore';
import { supabase } from './supabase';
import { clearAuthCache, validateAuthToken } from './utils/authUtils';
import { applySecurityHeaders } from './middleware/security';
import { updateLastActivity, startSessionTimeout } from './utils/securityUtils';
import { auditLog, AUDIT_LOG_TYPE } from './utils/auditLogger';
import Navbar from './components/Navbar';
import { Login } from './components/Login';

// Lazy load route components
const ExpenseList = lazy(() => import('./components/ExpenseList'));
const ExpenseForm = lazy(() => import('./components/ExpenseForm'));
const Analytics = lazy(() => import('./components/Analytics'));
const Settlement = lazy(() => import('./components/Settlement'));
import ProtectedRoute from './components/ProtectedRoute';
import type { User, NotificationPreferences } from './types';

// Initialize performance monitoring
initializePerformanceMonitoring();

// Initialize persistent store
createPersistentStore(useUserStore, 'user-store');

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
  const { setCurrentUser, setInitialized, logout } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Apply security headers
    applySecurityHeaders();

    // Setup session timeout
    startSessionTimeout(async () => {
      await auditLog(
        AUDIT_LOG_TYPE.SECURITY_EVENT,
        'Session timeout',
        { message: 'User session timed out due to inactivity' }
      );
      logout();
    });

    const handleAuth = async (session: any) => {
      try {
        if (!session?.user) {
          setCurrentUser(null);
          setInitialized(true);
          return;
        }

        // Validate token
        const isValid = await validateAuthToken();
        if (!isValid) {
          await auditLog(
            AUDIT_LOG_TYPE.SECURITY_EVENT,
            'Invalid auth token',
            { userId: session.user.id }
          );
          throw new Error('Invalid auth token');
        }

        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          await auditLog(
            AUDIT_LOG_TYPE.AUTH_FAILURE,
            'Profile fetch failed',
            { userId: session.user.id, error: profileError.message }
          );
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
            notifications: (profile?.notification_preferences as NotificationPreferences) || defaultNotificationPreferences
          },
        };

        setCurrentUser(newUser);
        setInitialized(true);

        // Update last activity timestamp
        updateLastActivity();

        // Log successful authentication
        await auditLog(
          AUDIT_LOG_TYPE.AUTH_SUCCESS,
          'User authenticated',
          { userId: newUser.id, email: newUser.email }
        );
      } catch (error) {
        await auditLog(
          AUDIT_LOG_TYPE.AUTH_FAILURE,
          'Auth check failed',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
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
  const currentUser = useUserStore((state: UserState) => state.currentUser);
  const isInitialized = useUserStore((state: UserState) => state.isInitialized);

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
                    <Suspense fallback={<LoadingSpinner />}>
                      <ExpenseList />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/add" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <ExpenseForm />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Analytics />
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settlement" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Settlement />
                    </Suspense>
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
