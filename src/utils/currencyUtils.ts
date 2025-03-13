/**
 * Currency utility functions for formatting amounts in GBP
 */

/**
 * Format a numeric amount as GBP currency
 * @param amount - The amount to format
 * @returns Formatted amount with £ symbol
 */
export function formatAmount(amount: number): string {
  // Always use the GBP symbol
  return `£${parseFloat(amount.toString()).toFixed(2)}`;
}

/**
 * Alias for formatAmount for backward compatibility
 */
export const formatCurrency = formatAmount; 