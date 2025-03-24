import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { BarChart3, Home, PiggyBank, Settings, ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  // Get users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    onError: () => {
      toast({
        title: "Error",
        description: "Could not load users data",
        variant: "destructive"
      });
    }
  });
  
  const closeMobileMenu = () => setMobileMenuOpen(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Expenses', href: '/expenses', icon: ShoppingCart },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settlement', href: '/settlement', icon: PiggyBank },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  // Find the current user (default to the first user)
  const currentUser = users?.length ? users[0] : null;
  
  const switchUser = () => {
    if (!users || users.length < 2) return;
    
    const newUser = users[0].id === currentUser?.id ? users[1] : users[0];
    
    toast({
      title: "User Switched",
      description: `Now logged in as ${newUser.username}`,
      variant: "default"
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
            <h1 className="text-xl font-bold text-gray-800">ExpenseTogether</h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  location === item.href
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-600 hover:text-primary hover:bg-blue-50',
                  'flex items-center px-2 py-2 text-sm font-medium rounded-md group'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'JD'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">
                  {currentUser ? currentUser.username : 'Loading...'}
                </p>
                <button 
                  className="text-xs font-medium text-gray-500 hover:text-primary"
                  onClick={switchUser}
                  disabled={usersLoading || !users || users.length < 2}
                >
                  Switch User
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-gray-800">ExpenseTogether</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(true)}
            className="flex-shrink-0"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'JD'}
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
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
                      ? 'text-primary bg-blue-50'
                      : 'text-gray-600 hover:text-primary hover:bg-blue-50',
                    'flex items-center px-2 py-2 text-sm font-medium rounded-md group'
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
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                    {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : 'JD'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser ? currentUser.username : 'Loading...'}
                  </p>
                  <button 
                    className="text-xs font-medium text-gray-500 hover:text-primary"
                    onClick={switchUser}
                    disabled={usersLoading || !users || users.length < 2}
                  >
                    Switch User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-20 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                'flex flex-col items-center py-3',
                location === item.href ? 'text-primary' : 'text-gray-600'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
