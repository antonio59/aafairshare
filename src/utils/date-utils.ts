/**
 * Date utility functions for consistent date handling across the application
 */

interface Expense {
  date: string;
  [key: string]: any;
}

interface ExpenseGroups {
  [date: string]: Expense[];
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export type Month = typeof MONTHS[number];

/**
 * Formats a date into Month YYYY format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "January 2024")
 */
export function formatMonthYear(date: Date | string): string {
  const dateObj = new Date(date);
  return `${dateObj.toLocaleString('default', { month: 'long' })} ${dateObj.getFullYear()}`;
}

/**
 * Gets the current month and year in Month YYYY format
 * @returns Current month and year string
 */
export function getCurrentMonthYear(): string {
  const now = new Date();
  return formatMonthYear(now);
}

/**
 * Gets the month name from a date
 * @param date - The date to get month from
 * @returns Month name
 */
export function getMonthName(date: Date | string): string {
  return new Date(date).toLocaleString('default', { month: 'long' });
}

/**
 * Gets the year from a date
 * @param date - The date to get year from
 * @returns Year
 */
export function getYear(date: Date | string): number {
  return new Date(date).getFullYear();
}

/**
 * Checks if a date is in the current month
 * @param dateString - The date string to check
 * @returns Whether the date is in the current month
 */
export function isCurrentMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear();
}

/**
 * Formats a date string to YYYY-MM-DD format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDateString(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Gets the current date in ISO format
 * @returns Current date in ISO format
 */
export const getCurrentISODate = (): string => {
  return formatDateString(new Date().toISOString());
};

/**
 * Converts a date to UK format (dd/mm/yyyy)
 * @param isoDate - Date in ISO format (yyyy-mm-dd)
 * @returns Date in UK format
 */
export const toUKDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a date for display in the UI with full month name
 * @param isoDate - Date in ISO format (yyyy-mm-dd)
 * @returns Formatted date (e.g., "Monday, 08 March 2025")
 */
export const formatDisplayDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formats a time in 24-hour UK format
 * @param isoDate - Date in ISO format
 * @returns Time in 24-hour format (e.g., "14:30")
 */
export const formatTime = (isoDate: string): string => {
  return new Date(isoDate).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Formats a date for grouping in the UI
 * @param date - Date object
 * @returns Formatted date (e.g., "Today", "Yesterday", or "Monday, 08 March")
 */
export const formatDateForGrouping = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });
};

/**
 * Groups expenses by date
 * @param expenses - Array of expense objects
 * @returns Expenses grouped by date in UK format
 */
export const groupExpensesByDate = (expenses: Expense[]): ExpenseGroups => {
  return expenses.reduce<ExpenseGroups>((groups, expense) => {
    const ukDate = toUKDate(expense.date);
    
    if (!groups[ukDate]) {
      groups[ukDate] = [];
    }
    groups[ukDate].push(expense);
    return groups;
  }, {});
};

/**
 * Alias for toUKDate for backward compatibility
 */
export const formatDateToUK = toUKDate;