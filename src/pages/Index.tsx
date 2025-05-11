
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isOnline } from '@/integrations/supabase/client';
import { Loader2, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're online first
        if (!isOnline()) {
          console.log("Offline detected, showing login");
          navigate('/login');
          return;
        }
        
        // Clean up existing state if issues detected
        if (localStorage.getItem('auth-error-detected') === 'true') {
          console.log("Auth error detected, cleaning up state");
          localStorage.removeItem('auth-error-detected');
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('aafairshare-auth')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        console.info("Main entry point loading");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          navigate('/login');
          return;
        }
        
        if (data.session) {
          console.log("Session found, redirecting to dashboard");
          navigate('/');
        } else {
          console.log("No session found, redirecting to login");
          navigate('/login');
        }
        
        console.info("App rendered successfully");
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold mb-4">Welcome to AAFairShare</h1>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
        <p className="text-xl text-gray-600">Loading your dashboard...</p>
        
        {!isOnline() && (
          <Alert variant="destructive" className="mt-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You appear to be offline. Check your internet connection.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Index;
