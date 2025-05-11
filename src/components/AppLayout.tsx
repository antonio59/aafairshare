
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Calendar, Home, PiggyBank, Settings as SettingsIcon, LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { syncAuthUser, getCurrentUser, logoutUser } from "@/services/api/userService";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const AppLayout = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initializing...");
  const navigate = useNavigate();
  
  useEffect(() => {
    let isMounted = true;
    let authCheckTimeout: number | null = null;
    
    const checkAuth = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setLoadingText("Checking authentication...");
        
        // Set timeout to detect potential auth deadlocks
        authCheckTimeout = window.setTimeout(() => {
          if (isMounted) {
            console.warn("Authentication check is taking too long, possible deadlock");
            localStorage.setItem('auth-error-detected', 'true');
            navigate('/login');
          }
        }, 10000); // 10 second timeout
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;
            
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
        
        // Check initial session
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
          }
          return;
        }
        
        if (!session) {
          if (isMounted) {
            console.log("No active session found");
            navigate('/login');
          }
          return;
        }
        
        await loadUserData();
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth error:", error);
        if (isMounted) {
          navigate('/login');
        }
      } finally {
        if (authCheckTimeout) {
          clearTimeout(authCheckTimeout);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    const loadUserData = async () => {
      if (!isMounted) return;
      try {
        setLoadingText("Loading user data...");
        // First try to get current user
        let currentUser = await getCurrentUser();
        
        // If that fails, try to sync auth user
        if (!currentUser) {
          setLoadingText("Synchronizing user data...");
          currentUser = await syncAuthUser();
        }
        
        if (currentUser) {
          setUser(currentUser);
          setIsLoading(false);
        } else {
          // If we still can't get a user, go to the login page
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
          setIsLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
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
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-64 space-y-4 text-center">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
          <p className="text-lg font-medium">{loadingText}</p>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-56 bg-white app-sidebar flex flex-col justify-between">
        <div>
          <div className="p-4 border-b">
            <h1 className="text-lg font-bold">AAFairShare</h1>
          </div>
          <nav className="p-2">
            <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Dashboard" />
            <NavItem to="/settlement" icon={<PiggyBank className="w-5 h-5" />} label="Settlement" />
            <NavItem to="/analytics" icon={<BarChart3 className="w-5 h-5" />} label="Analytics" />
            <NavItem to="/recurring" icon={<Calendar className="w-5 h-5" />} label="Recurring" />
            <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Settings" />
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} alt={user?.name || ""} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
              <button 
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors mb-1",
          isActive
            ? "bg-gray-100 text-gray-900 font-medium"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default AppLayout;
