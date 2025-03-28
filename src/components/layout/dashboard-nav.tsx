'use client'

import {
  DollarSign,
  Home,
  Settings,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Home',
    icon: Home,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Expenses',
    icon: DollarSign,
    href: '/dashboard/expenses',
    color: 'text-violet-500',
  },
  {
    label: 'Friends',
    icon: Users,
    color: 'text-pink-700',
    href: '/dashboard/friends',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
  },
]

export function DashboardNav(): JSX.Element {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                pathname === route.href ? 'text-primary bg-primary/10' : 'text-muted-foreground',
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 