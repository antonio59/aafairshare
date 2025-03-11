export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export type Month = typeof MONTHS[number];

/**
 * Formats a date into Month YYYY format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
}

/**
 * Gets the current month and year in Month YYYY format
 * @returns Current month and year string
 */
export function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
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