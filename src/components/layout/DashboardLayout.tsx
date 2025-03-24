'use client';

import { 
  BarChart3,
  DollarSign, 
  Home, 
  Settings, 
  Users 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';


interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Expenses',
      href: '/expenses',
      icon: DollarSign,
    },
    {
      name: 'Settlements',
      href: '/settlements',
      icon: BarChart3,
    },
    {
      name: 'Groups',
      href: '/groups',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    }
  ];
  
  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(`${path}/`);
  
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <IconComponent />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <div className="dashboard-main">
        <div className="dashboard-content">
          {children}
        </div>
      </div>
    </div>
  );
}
