import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Analytics from "@/pages/Analytics";
import Settlement from "@/pages/Settlement";
import Settings from "@/pages/Settings";
import RecurringExpenses from "@/pages/RecurringExpenses";
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

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const { data: authData, isLoading, isError } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: 1, // Retry once in case of network issues
    retryDelay: 1000, // Wait 1 second before retrying
  });

  useEffect(() => {
    if (!isLoading && (!authData || !authData.isAuthenticated)) {
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
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (isError || !authData || !authData.isAuthenticated) {
    return null; // The useEffect will redirect to login
  }

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
        <Route path="/expenses">
          {() => <ProtectedRoute component={Expenses} />}
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
        <Route path="/recurring-expenses">
          {() => <ProtectedRoute component={RecurringExpenses} />}
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
