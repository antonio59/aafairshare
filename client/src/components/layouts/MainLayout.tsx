import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { BarChart3, Home, PiggyBank, Settings, ShoppingCart, RepeatIcon, PlusIcon } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  // Define the auth status response type
  interface AuthStatusResponse {
    isAuthenticated: boolean;
    user?: {
      id: number;
      username: string;
    };
  }
  
  // Get current user from auth status
  const { data: authData, isLoading: authLoading } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status']
  });
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Settlement', href: '/settlement', icon: PiggyBank },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  // Get current user from auth data
  const currentUser = authData?.isAuthenticated ? authData.user : null;
  
  const handleLogout = async () => {
    try {
      // Use fetch directly with proper credentials
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // Invalidate auth state regardless of response
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      // Show success message and redirect
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Redirect to login page
      setLocation('/login');
    } catch (error) {
      // Even if there's an error, we'll still redirect and consider it a success
      // This prevents showing error messages to users
      console.error("Logout error:", error);
      setLocation('/login');
    }
  };
  
  return (
    <div className="min-h-[100vh] max-h-[100vh] flex flex-col md:flex-row overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r border-border dark:bg-card">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-16 border-b border-border px-4">
            <h1 className="text-xl font-bold text-foreground">AAFairShare</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  location === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-foreground hover:text-primary hover:bg-primary/5',
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'JD'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {currentUser ? currentUser.username : 'Loading...'}
                </p>
                <button 
                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Layout - fixed header, scrollable content, fixed footer */}
      <div className="flex flex-col w-full h-[100vh] md:hidden">
        {/* Fixed Mobile Header */}
        <header className="bg-card border-b border-border fixed top-0 left-0 right-0 z-40 pt-safe">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-foreground dark:text-white">AAFairShare</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  // Publish a custom event to trigger add expense
                  const event = new CustomEvent('add-expense-event');
                  window.dispatchEvent(event);
                }}
                className="h-10 w-10 rounded-full"
                aria-label="Add expense"
              >
                <PlusIcon className="h-5 w-5 text-primary" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(true)}
                className="flex-shrink-0 h-10 w-10 rounded-full"
              >
                <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-medium shadow-sm">
                  {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'JD'}
                </div>
              </Button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area for Mobile */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-16 overscroll-contain">
          <div className="px-4 py-4">
            {children}
          </div>
        </main>

        {/* Fixed Mobile Footer Navigation */}
        <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 pb-safe">
          <div className="flex justify-around">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-2 transition-colors touch-target',
                  location === item.href 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground active:text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1.5 font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </footer>
      </div>

      {/* Mobile Menu Overlay */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[250px] sm:w-[300px] border-r pt-safe">
          <div className="py-4">
            <h2 className="text-lg font-semibold px-4 mb-4">Menu</h2>
            <nav className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    location === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:text-primary hover:bg-primary/5',
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-8 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                    {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'JD'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">
                    {currentUser ? currentUser.username : 'Loading...'}
                  </p>
                  <button 
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Main Content */}
      <main className="hidden md:block flex-1 md:ml-64 min-h-screen pt-safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 pb-24 md:pb-8 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
