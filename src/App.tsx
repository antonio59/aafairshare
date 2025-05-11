import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase, isOnline } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Settlement from "./pages/Settlement";
import Analytics from "./pages/Analytics";
import Recurring from "./pages/Recurring";
import Settings from "./pages/Settings";
import AddExpense from "./pages/AddExpense";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";

// Initialize QueryClient with default settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOnlineStatus, setIsOnlineStatus] = useState<boolean>(isOnline());
  
  // Network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnlineStatus(true);
    const handleOffline = () => setIsOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    console.info("App component mounting, checking auth state");
    
    const checkAuth = async () => {
      try {
        // Clean up existing state if issues detected
        if (localStorage.getItem('auth-error-detected') === 'true') {
          console.info("Auth error detected, cleaning up state");
          localStorage.removeItem('auth-error-detected');
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state changed:", event);
            setIsAuthenticated(!!session);
            
            if (event === 'SIGNED_OUT') {
              console.log("User signed out, redirecting to login");
              // Force a clean slate on sign out
              window.location.href = '/login';
            }
          }
        );
        
        // Check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsAuthenticated(false);
          return;
        }
        
        console.log("Session check complete:", data.session ? "Session found" : "No session");
        setIsAuthenticated(!!data.session);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    
    // Check connection status
    if (isOnlineStatus) {
      checkAuth();
    } else {
      setIsAuthenticated(false);
    }
  }, [isOnlineStatus]);
  
  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="font-medium">Initializing app...</p>
          <p className="text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isOnlineStatus && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-2 text-center">
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                You are currently offline. Some features may not work properly.
              </AlertDescription>
            </Alert>
          </div>
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
              <Route index element={<Dashboard />} />
              <Route path="settlement" element={<Settlement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="recurring" element={<Recurring />} />
              <Route path="settings" element={<Settings />} />
              <Route path="add-expense" element={<AddExpense />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
