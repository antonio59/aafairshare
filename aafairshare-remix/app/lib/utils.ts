import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse } from "date-fns";
// Import shared formatting utilities
import { formatCurrency, formatDate as sharedFormatDate } from "~/shared/formatting";

// Re-export the shared formatCurrency function
export { formatCurrency };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

export function formatMonthYear(month: string): string {
  // month format is YYYY-MM
  const date = parse(month + '-01', 'yyyy-MM-dd', new Date());
  return format(date, 'MMMM yyyy');
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthFromDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM');
}

export function getNextMonth(month: string): string {
  const date = parse(month + '-01', 'yyyy-MM-dd', new Date());
  date.setMonth(date.getMonth() + 1);
  return format(date, 'yyyy-MM');
}

export function getPreviousMonth(month: string): string {
  const date = parse(month + '-01', 'yyyy-MM-dd', new Date());
  date.setMonth(date.getMonth() - 1);
  return format(date, 'yyyy-MM');
}

export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

// --- Category Color Utilities ---

// Returns Tailwind CSS classes for category TEXT color (light/dark mode aware)
export const getCategoryColorClass = (categoryName?: string): string => {
  switch (categoryName?.toLowerCase()) {
    case 'groceries':
      return 'text-green-700 dark:text-green-400';
    case 'utilities':
      return 'text-blue-700 dark:text-blue-400';
    case 'rent':
      return 'text-purple-700 dark:text-purple-400';
    case 'transport':
      return 'text-orange-700 dark:text-orange-400';
    case 'entertainment':
      return 'text-pink-700 dark:text-pink-400';
    case 'food & drink':
    case 'dining':
      return 'text-red-700 dark:text-red-400';
    case 'shopping':
      return 'text-indigo-700 dark:text-indigo-400';
    case 'gifts':
      return 'text-rose-700 dark:text-rose-400';
    case 'health':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'holidays':
      return 'text-cyan-700 dark:text-cyan-400';
    case 'subscriptions':
      return 'text-amber-700 dark:text-amber-400';
    // Add more categories here as needed
    default:
      return 'text-gray-600 dark:text-gray-400'; // Default/Uncategorized
  }
};

// Returns Tailwind CSS classes for category BACKGROUND color swatches (light/dark mode aware)
export const getCategoryBackgroundColorClass = (categoryName?: string): string => {
  switch (categoryName?.toLowerCase()) {
    case 'groceries':
      return 'bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600';
    case 'utilities':
      return 'bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-600';
    case 'rent':
      return 'bg-purple-100 dark:bg-purple-800 border-purple-300 dark:border-purple-600';
    case 'transport':
      return 'bg-orange-100 dark:bg-orange-800 border-orange-300 dark:border-orange-600';
    case 'entertainment':
      return 'bg-pink-100 dark:bg-pink-800 border-pink-300 dark:border-pink-600';
    case 'food & drink':
    case 'dining':
      return 'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600';
    case 'shopping':
      return 'bg-indigo-100 dark:bg-indigo-800 border-indigo-300 dark:border-indigo-600';
    case 'gifts':
      return 'bg-rose-100 dark:bg-rose-800 border-rose-300 dark:border-rose-600';
    case 'health':
      return 'bg-emerald-100 dark:bg-emerald-800 border-emerald-300 dark:border-emerald-600';
    case 'holidays':
      return 'bg-cyan-100 dark:bg-cyan-800 border-cyan-300 dark:border-cyan-600';
    case 'subscriptions':
      return 'bg-amber-100 dark:bg-amber-800 border-amber-300 dark:border-amber-600';
    // Add more categories here as needed
    default:
      return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500'; // Default/Uncategorized
  }
};
