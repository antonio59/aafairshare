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
  const { data: authData, isLoading } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && (!authData || !authData.isAuthenticated)) {
      setLocation('/login');
    }
  }, [authData, isLoading, setLocation]);

  if (isLoading || !authData || !authData.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we verify your authentication.</p>
        </div>
      </div>
    );
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
