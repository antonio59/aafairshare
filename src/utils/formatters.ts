/**
 * Utility functions for formatting data
 */

/**
 * Format a number as currency (GBP)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Legacy dollar formatter - DO NOT USE, kept for backwards compatibility
 * @deprecated Use formatCurrency instead
 */
export function formatDollar(amount: number): string {
  return formatCurrency(amount);
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a month string (YYYY-MM) to a readable month and year
 */
export function formatMonth(monthString: string): string {
  const parts = monthString.split('-');
  
  if (parts.length !== 2) {
    return monthString; // Return original if not in YYYY-MM format
  }
  
  const [year, month] = parts;
  
  if (!year || !month) {
    return monthString; // Return original if missing parts
  }
  
  try {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
    
    if (isNaN(yearNum) || isNaN(monthNum)) {
      return monthString;
    }
    
    const date = new Date(yearNum, monthNum);
    
    return date.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  } catch (error) {
    return monthString; // Return original if any error occurs
  }
}
