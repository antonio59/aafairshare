'use client';

import {
  DollarSign,
  Home,
  Landmark,
  LogOut,
  Menu,
  Settings,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export interface NavBarProps {
  className?: string;
}

export function NavBar({ className }: NavBarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [signOut, router]);

  const isActive = useCallback(
    (path: string) => {
      return pathname === path || pathname?.startsWith(`${path}/`);
    },
    [pathname]
  );

  // Don't show the navbar on authentication pages
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/reset-password') {
    return null;
  }

  return (
    <header
      className={cn(
        'navbar',
        className
      )}
    >
      {/* Skip to content link for keyboard users */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="navbar-logo">
            <Landmark className="h-6 w-6" />
            <span>FairShare</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <Link
            href="/dashboard"
            className={cn(
              'navbar-link',
              isActive('/dashboard') && 'active'
            )}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            href="/expenses"
            className={cn(
              'navbar-link',
              isActive('/expenses') && 'active'
            )}
          >
            <DollarSign className="h-4 w-4" />
            <span>Expenses</span>
          </Link>
          
          <Link
            href="/settlements"
            className={cn(
              'navbar-link',
              isActive('/settlements') && 'active'
            )}
          >
            <Landmark className="h-4 w-4" />
            <span>Settlements</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className={cn(
              'hidden md:flex navbar-link',
              isActive('/settings') && 'active'
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link href="/signin">Log in</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                aria-label="Open navigation menu"
                aria-haspopup="true"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 md:hidden">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/expenses">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>Expenses</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settlements">
                    <Landmark className="mr-2 h-4 w-4" />
                    <span>Settlements</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
