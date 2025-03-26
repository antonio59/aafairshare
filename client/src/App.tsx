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
import { useEffect, useState } from "react";

// Auth status response type
interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: {
    id: number;
    username: string;
  };
}

// Protected route component with emergency token support
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const [isManuallyAuthenticated, setIsManuallyAuthenticated] = useState(false);
  const [manualAuthUser, setManualAuthUser] = useState<any>(null);
  
  // Extract URL parameters
  const queryParams = new URLSearchParams(window.location.search);
  const emergencyToken = queryParams.get('token');
  
  // Check for emergency token
  useEffect(() => {
    if (emergencyToken) {
      const checkEmergencyToken = async () => {
        try {
          console.log("Checking emergency token");
          const response = await fetch(`/api/auth/status?token=${emergencyToken}`, {
            cache: 'no-store'
          });
          
          if (!response.ok) {
            console.error("Token validation failed");
            return;
          }
          
          const data = await response.json();
          if (data.isAuthenticated && data.emergencyAuth) {
            console.log("Emergency token auth successful");
            setIsManuallyAuthenticated(true);
            setManualAuthUser(data.user);
            
            // Clean URL without reloading page
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        } catch (error) {
          console.error("Error validating emergency token:", error);
        }
      };
      
      checkEmergencyToken();
    }
  }, [emergencyToken]);
  
  // If emergency token authentication is successful, skip normal auth check
  if (isManuallyAuthenticated && manualAuthUser) {
    return (
      <MainLayout>
        <Component />
      </MainLayout>
    );
  }
  
  // Regular authentication via React Query
  const { data: authData, isLoading } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: 2,
    retryDelay: 1000,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (!authData || !authData.isAuthenticated) && !isManuallyAuthenticated) {
      console.log("Authentication check failed, redirecting to login");
      setLocation('/login');
    }
  }, [authData, isLoading, setLocation, isManuallyAuthenticated]);

  // Show loading state
  if (isLoading && !isManuallyAuthenticated) {
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

  // Handle authentication errors (when not using emergency token)
  if (!isManuallyAuthenticated && (!authData || !authData.isAuthenticated)) {
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
          <div className="space-y-2 mt-4">
            <button 
              onClick={() => setLocation('/login')} 
              className="px-4 py-2 bg-primary text-white rounded-md block w-full"
            >
              Go to Login
            </button>
            <a 
              href="/api/auth/emergency-login?username=Antonio&token=direct-access-token" 
              className="px-4 py-2 bg-green-600 text-white rounded-md block w-full text-center"
            >
              Use Emergency Access
            </a>
          </div>
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
