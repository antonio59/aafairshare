
import { Outlet, NavLink } from "react-router-dom";
import { BarChart3, Calendar, Home, PiggyBank, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const AppLayout = () => {
  const { toast } = useToast();
  const [user] = useState({
    name: "Antonio Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio"
  });
  
  useEffect(() => {
    console.log("AppLayout mounted");
  }, []);

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
          <ThemeToggle />
          <div className="flex items-center gap-2 mt-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <button 
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => toast({
                  title: "Logout",
                  description: "This feature would log you out in a real app."
                })}
              >
                Logout
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
