
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Clean up existing state if issues detected
        if (localStorage.getItem('auth-error-detected') === 'true') {
          console.log("Auth error detected, cleaning up state");
          localStorage.removeItem('auth-error-detected');
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
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
      </div>
    </div>
  );
};

export default Index;
