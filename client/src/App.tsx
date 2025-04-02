import React, { lazy, Suspense, ComponentType } from "react"; // Removed useEffect
// Removed unused useLocation import
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./context/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load page components
const NotFound = lazy(() => import("@/pages/not-found"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Settlement = lazy(() => import("@/pages/Settlement"));
const Settings = lazy(() => import("@/pages/Settings"));
const Login = lazy(() => import("@/pages/Login"));

// Simple loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center space-y-4">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <h2 className="text-lg font-medium">Loading Page...</h2>
    </div>
  </div>
);

// Define the props the wrapped component might receive from the Route/ProtectedRoute
type RouteComponentProps<P = object> = P & {
  params?: Record<string, string | undefined>;
};

// Define the props for ProtectedRoute itself
// It receives the component and the rest of the props intended for that component
type ProtectedRouteProps<P extends object> = {
  component: ComponentType<RouteComponentProps<P>>;
} & RouteComponentProps<P>; // Include potential params and other props for the wrapped component


// Updated Protected route component using generics and AuthContext
function ProtectedRoute<P extends object>({ component: Component, ...rest }: ProtectedRouteProps<P>) {
  const { currentUser, userProfile, loading, profileLoading } = useAuth(); // Added profileLoading
  // Removed unused location variable

  // Show loading state while auth check and profile fetch are in progress
  // Show loading state while initial auth check OR profile fetch are in progress
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Loading Spinner */}
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {loading ? 'Checking authentication...' : 'Loading user profile...'}
          </p>
        </div>
      </div>
    );
  }

  // After loading is complete:
  // If no user OR no profile, redirect to login.
  if (!currentUser || !userProfile) {
    // Use console.warn or remove in production
    console.warn("ProtectedRoute: Not authenticated or no user profile after loading. Redirecting to login.", { currentUser, userProfile });
    return <Redirect to="/login" />;
  }

  // User is authenticated and has profile, render the component
  // Pass the rest of the props (which include params if provided) to the Component
  // Cast `rest` because TS doesn't know it matches RouteComponentProps<P> perfectly after destructuring `component`
  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Component {...(rest as RouteComponentProps<P>)} />
      </Suspense>
    </MainLayout>
  );
}


// App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            {/* Public route */}
            <Route path="/login" component={Login} />

            {/* Protected Routes - No extra props needed for these components */}
            <ProtectedRoute path="/" component={Dashboard} />
            <ProtectedRoute path="/analytics" component={Analytics} />
            <ProtectedRoute path="/settlement" component={Settlement} />
            <ProtectedRoute path="/settings" component={Settings} />

            {/* Catch-all for 404 - protected as well */}
            {/* The component={NotFound} expects params, which are passed correctly */}
            <Route path="/:rest*">
              {(params) => <ProtectedRoute component={NotFound} params={params} />}
            </Route>
          </Switch>
        </Suspense>
      </ErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
