
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Calendar, Home, PiggyBank, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { syncAuthUser, getCurrentUser, logoutUser } from "@/services/api/userService";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const AppLayout = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN') {
              // Defer loading user data
              setTimeout(() => {
                loadUserData();
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              navigate('/login');
            }
          }
        );
        
        // Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        await loadUserData();
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth error:", error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadUserData = async () => {
      try {
        // First, sync the auth user with our users table
        const syncedUser = await syncAuthUser();
        if (syncedUser) {
          setUser(syncedUser);
        } else {
          // If we couldn't sync or find the user, try to get current user
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            // If still no user, redirect to login
            navigate('/login');
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
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
              <p className="text-sm font-medium truncate">{user?.name || "Loading..."}</p>
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
