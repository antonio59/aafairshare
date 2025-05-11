
import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { syncAuthUser, getCurrentUser, logoutUser } from "@/services/api/userService";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "./LoadingScreen";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initializing...");
  const [retryCount, setRetryCount] = useState(0);
  const [authTimeout, setAuthTimeout] = useState<number | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setLoadingText("Checking authentication...");
        
        // Set timeout to detect potential auth deadlocks - increased timeout
        const timeout = window.setTimeout(() => {
          if (isMounted) {
            console.warn("Authentication check is taking too long, possible deadlock");
            localStorage.setItem('auth-error-detected', 'true');
            navigate('/login');
          }
        }, 15000); // 15 second timeout
        
        setAuthTimeout(timeout);
        
        // First set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;
            
            console.log("Auth state changed:", event);
            
            if (event === 'SIGNED_IN') {
              // Defer loading user data to avoid potential deadlocks
              setTimeout(() => {
                if (isMounted) loadUserData();
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              navigate('/login');
            }
          }
        );
        
        // After listener setup, check for existing session
        console.log("Checking for existing session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            toast({
              title: "Session error",
              description: "Please login again",
              variant: "destructive",
            });
            navigate('/login');
            setIsLoading(false);
          }
          return;
        }
        
        if (!session) {
          if (isMounted) {
            console.log("No active session found, redirecting to login");
            navigate('/login');
            setIsLoading(false);
          }
          return;
        }
        
        console.log("Active session found, user ID:", session.user.id);
        
        // Load user data asynchronously
        await loadUserData();
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth error:", error);
        if (isMounted) {
          setIsLoading(false);
          navigate('/login');
        }
      } finally {
        if (authTimeout) {
          clearTimeout(authTimeout);
        }
      }
    };
    
    const loadUserData = async () => {
      if (!isMounted) return;
      try {
        setLoadingText("Loading user data...");
        console.log("Loading user data, attempt:", retryCount + 1);
        
        // First try to get current user
        let currentUser = await getCurrentUser();
        
        // If that fails, try to sync auth user
        if (!currentUser && retryCount < 2) {
          setLoadingText("Synchronizing user data...");
          console.log("Attempting to sync auth user...");
          currentUser = await syncAuthUser();
        }
        
        if (currentUser) {
          console.log("User data loaded successfully:", currentUser.name);
          setUser(currentUser);
          setIsLoading(false);
        } else {
          // If we still can't get a user after retries, go to the login page
          console.warn("Could not retrieve user data, redirecting to login");
          toast({
            title: "Authentication error",
            description: "Please login again",
            variant: "destructive",
          });
          
          // Mark auth error for cleanup on next load
          localStorage.setItem('auth-error-detected', 'true');
          
          await logoutUser();
          navigate('/login');
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        if (isMounted) {
          if (retryCount < 2) {
            const delay = Math.pow(2, retryCount) * 1000;
            setRetryCount(prevCount => prevCount + 1);
            setTimeout(() => {
              if (isMounted) loadUserData();
            }, delay);
          } else {
            setIsLoading(false);
            navigate('/login');
          }
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully."
      });
      // Force a page reload for clean state
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen loadingText={loadingText} />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
