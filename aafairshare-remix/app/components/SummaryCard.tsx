import React from 'react';
import { cn } from '~/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { LucideIcon } from 'lucide-react';

type SummaryCardVariant = 'total' | 'user1' | 'user2' | 'balance';

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  variant?: SummaryCardVariant;
  isNegative?: boolean;
  tooltip?: string;
  isLoading?: boolean;
  photoURL?: string | null;
  email?: string;
}

export default function SummaryCard({
  title,
  value,
  icon: IconComponent,
  variant = 'total',
  isNegative = false,
  tooltip,
  isLoading = false,
  photoURL,
  email
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const getBgColor = () => {
    switch (variant) {
      case 'total':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'user1':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'user2':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'balance':
        return isNegative
          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        {photoURL ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={photoURL} alt={email || 'User'} />
            <AvatarFallback className={cn(getBgColor())}>
              {email ? email.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        ) : IconComponent ? (
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", getBgColor())}>
            <IconComponent className="h-5 w-5" />
          </div>
        ) : (
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", getBgColor())}>
            <span className="text-lg font-medium">£</span>
          </div>
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1" title={tooltip}>
            {title}
          </div>
          <div className={cn(
            "text-2xl font-bold",
            isNegative ? "text-red-500 dark:text-red-400" : ""
          )}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
