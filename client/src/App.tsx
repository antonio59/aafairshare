import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Settlement from "@/pages/Settlement";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MainLayout from "@/components/layouts/MainLayout";
import { useEffect } from "react";

// Auth status response type
interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: {
    id: number;
    username: string;
  };
}

// Protected route component with improved authentication handling
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  
  // Direct fetch auth status for more control and debugging
  const checkAuth = async () => {
    try {
      console.log("Directly checking authentication status");
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store'
        },
        cache: 'no-cache'
      });
      
      console.log("Auth check response status:", response.status);
      
      // Log cookie presence (without revealing values)
      console.log("Document cookies exist:", document.cookie.length > 0);
      
      if (!response.ok) {
        console.error("Auth check failed with status:", response.status);
        return false;
      }
      
      const data = await response.json();
      console.log("Direct auth check result:", data);
      return data.isAuthenticated;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };
  
  // Enhanced authentication check with staleTime: 0 to always refetch
  const { data: authData, isLoading, isError } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: 2, // Retry twice in case of network issues
    retryDelay: 1000, // Wait 1 second before retrying
    staleTime: 0, // Always consider data stale to force refetch
    refetchInterval: 30000, // Refresh auth status every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
  
  // Double-check authentication on mount with direct fetch
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        console.log("Direct auth check failed, redirecting to login");
        setLocation('/login');
      }
    };
    
    verifyAuth();
  }, [setLocation]);
  
  // React to query auth changes
  useEffect(() => {
    if (!isLoading && (!authData || !authData.isAuthenticated)) {
      console.log("Query auth check failed, redirecting to login");
      setLocation('/login');
    }
  }, [authData, isLoading, setLocation]);

  // Show loading state when checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h2 className="text-lg font-medium">Verifying your session...</h2>
          <p className="text-sm text-gray-500">Please wait, checking authentication status</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (isError || !authData || !authData.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="p-3 bg-red-100 text-red-800 rounded-full inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium">Authentication Required</h2>
          <p className="text-sm text-gray-500">Your session has expired or you're not logged in</p>
          <button 
            onClick={() => setLocation('/login')} 
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Successfully authenticated
  return (
    <MainLayout>
      <Component />
    </MainLayout>
  );
}

// App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/login" component={Login} />
        {/* Registration route disabled as per requirement */}
        <Route path="/register">
          {() => {
            // Redirect any attempts to access register page to login
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/login');
            }, []);
            return null;
          }}
        </Route>
        <Route path="/">
          {() => <ProtectedRoute component={Dashboard} />}
        </Route>
        <Route path="/analytics">
          {() => <ProtectedRoute component={Analytics} />}
        </Route>
        <Route path="/settlement">
          {() => <ProtectedRoute component={Settlement} />}
        </Route>
        <Route path="/settings">
          {() => <ProtectedRoute component={Settings} />}
        </Route>
        <Route>
          {() => <ProtectedRoute component={NotFound} />}
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
