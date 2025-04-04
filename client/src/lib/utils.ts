import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
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
       return 'text-red-700 dark:text-red-400';
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
       return 'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600';
    // Add more categories here as needed
    default:
      return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-500'; // Default/Uncategorized
  }
};
