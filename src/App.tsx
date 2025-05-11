
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Settlement from "./pages/Settlement";
import Analytics from "./pages/Analytics";
import Recurring from "./pages/Recurring";
import Settings from "./pages/Settings";
import AddExpense from "./pages/AddExpense";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

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
  
  useEffect(() => {
    console.info("App component rendering");
    
    const checkAuth = async () => {
      try {
        // Clean up existing state if issues detected
        if (localStorage.getItem('auth-error-detected') === 'true') {
          localStorage.removeItem('auth-error-detected');
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        // Check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(!!data.session);
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setIsAuthenticated(!!session);
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
