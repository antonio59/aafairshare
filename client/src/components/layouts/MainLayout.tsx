import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
// Removed unused Button import
// import { Button } from "@/components/ui/button";
// Removed unused ShoppingCart, RepeatIcon imports
import { Home, BarChart2, Settings, Users, PlusIcon } from "lucide-react"; // Keep PlusIcon for mobile add
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settlement", label: "Settlement", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation(); // Removed unused setLocation
  const { currentUser, userProfile, loading } = useAuth(); // Get userProfile

  // Function to get initials from username or email
  const getInitials = (name?: string | null, email?: string | null): string => {
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      // Keep email logic here for fallback, even if not displayed
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Function to dispatch the custom event for mobile add button
  const triggerMobileAddExpense = () => {
    window.dispatchEvent(new CustomEvent('add-expense-event'));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <span className="text-xl font-semibold text-primary">AAFairShare</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === item.href
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          {loading ? (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                {/* Removed email skeleton line */}
              </div>
            </div>
          ) : currentUser ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userProfile?.photoURL || currentUser.photoURL || undefined} alt={userProfile?.username || currentUser.displayName || "User"} />
                <AvatarFallback>{getInitials(userProfile?.username || currentUser.displayName, currentUser.email)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.username || currentUser.displayName || "User"}</p>
                {/* Removed email display line below */}
                {/* <p className="text-xs text-gray-500 truncate">{currentUser.email}</p> */}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not logged in</p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar (Optional - can be added if needed) */}
        {/* <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          Header Content
        </header> */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around h-16 items-center z-20">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
                location === item.href ? "text-primary" : "text-gray-500 hover:text-primary"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              {item.label}
            </a>
          </Link>
        ))}
        {/* Mobile Add Button - Dispatches Event */}
        <button
          onClick={triggerMobileAddExpense}
          className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-primary"
        >
          <PlusIcon className="h-6 w-6 mb-0.5" />
          Add
        </button>
      </nav>
    </div>
  );
}
