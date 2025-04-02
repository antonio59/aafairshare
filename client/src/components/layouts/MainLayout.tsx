import React, { ReactNode } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { Home, Users, BarChart2, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
// Import DropdownMenu for mobile profile
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // Import Button for trigger

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/settlement", label: "Settlement", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const { currentUser, userProfile, loading } = useAuth(); // Removed initialized
  const { toast } = useToast();

  // --- Redirect and Loading Logic ---
  // Show loading state first
  if (loading) {
     return ( <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div> );
  }
  // After loading, check if user is logged in. Redirect if not, unless already on login/register.
  if (!currentUser && location !== '/login' && location !== '/register') {
    console.warn("MainLayout: Not authenticated after loading. Redirecting to login.");
    return <Redirect to="/login" />;
  }
  // --- End Redirect/Loading ---

  const handleLogout = async () => {
    // ... (Keep existing handleLogout function) ...
    try {
      await auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout Error:", error);
      toast({ title: "Logout Failed", description: "Could not log out.", variant: "destructive" });
    }
  };

  const getInitials = (name?: string | null, email?: string | null): string => {
    // ... (Keep existing getInitials function) ...
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  return (
    // Use h-screen and overflow-hidden on the outer container for mobile layout control
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar (Desktop) - Added md:h-screen md:sticky md:top-0 */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 md:h-screen md:sticky md:top-0">
        {/* Sidebar Title Link */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 flex-shrink-0">
          {/* Apply styles directly to Link, which renders an <a> */}
          <Link href="/" className="text-xl font-semibold text-primary hover:text-primary-dark transition-colors">AAFairShare</Link>
        </div>
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            // Apply styles directly to Link
            <Link key={item.href} href={item.href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${ location === item.href ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" }`}>
              <item.icon className="mr-3 h-5 w-5" />{item.label}
            </Link>
          ))}
        </nav>
        {/* Sidebar Profile Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Increased Avatar size */}
              <Avatar className="h-12 w-12"><AvatarImage src={userProfile?.photoURL || currentUser.photoURL || undefined} alt={userProfile?.username || currentUser.displayName || "User"} /><AvatarFallback>{getInitials(userProfile?.username || currentUser.displayName, currentUser.email)}</AvatarFallback></Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.username || currentUser.displayName || "User"}</p>
                <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center"><LogOut className="mr-1 h-3 w-3" />Logout</button>
              </div>
            </div>
          ) : ( <p className="text-sm text-gray-500">Not logged in</p> )}
        </div>
      </aside>

      {/* Main Content Area - Changed to h-screen and overflow-y-auto for all sizes */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile Header - Kept sticky */}
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 flex-shrink-0">
          {/* Mobile App Title/Logo Link */}
          {/* Apply styles directly to Link */}
          <Link href="/" className="text-lg font-semibold text-primary leading-[3.5rem]">
            AAFairShare
          </Link>

          {/* Mobile User Profile Dropdown */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Reduced size for button and avatar */}
                <Button variant="ghost" className="relative h-10 w-10 rounded-full"> {/* Changed h-12 w-12 to h-10 w-10 */}
                  <Avatar className="h-10 w-10"> {/* Changed h-12 w-12 to h-10 w-10 */}
                    <AvatarImage src={userProfile?.photoURL || currentUser.photoURL || undefined} alt={userProfile?.username || currentUser.displayName || "User"} />
                    <AvatarFallback>{getInitials(userProfile?.username || currentUser.displayName, currentUser.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel>{userProfile?.username || currentUser.displayName || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Link href="/login"><Button variant="outline" size="sm">Login</Button></Link> // Show login button if not logged in
          )}
        </header>

        {/* Page Content - Removed overflow-y-auto, adjusted padding */}
        {/* Added flex-shrink-0 to header, main takes remaining space */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-16 md:pb-8"> {/* Adjusted md padding bottom */}
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) - Kept fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around h-16 items-center z-20 px-1">
        {navItems.map((item) => (
          // Apply styles directly to Link
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center h-full text-xs font-medium transition-colors p-1 rounded-md w-full ${ // Added w-full for better touch area
              location === item.href
                ? "text-primary bg-primary/10"
                : "text-gray-500 hover:text-primary hover:bg-gray-100"
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
