/**
 * Safely parses a number from various input types
 * @param {unknown} value - Value to parse
 * @param {number} [defaultValue=0] - Default value if parsing fails
 * @returns {number} - Parsed number or default value
 */
export function parseNumber(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Formats a number to a fixed number of decimal places
 * @param {unknown} value - Value to format
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} - Formatted number
 */
export function formatDecimal(value: unknown, decimals: number = 2): string {
  return parseNumber(value).toFixed(decimals);
}

/**
 * Safely sums an array of numbers
 * @param {Array<unknown>} values - Array of values to sum
 * @param {((value: unknown) => unknown) | null} [mapper] - Optional mapping function
 * @returns {number} - Sum of values
 */
export function safeSum(
  values: Array<unknown>,
  mapper: ((value: unknown) => unknown) | null = null
): number {
  if (!Array.isArray(values)) return 0;
  return values.reduce((sum: number, value: unknown) => {
    const num = mapper ? parseNumber(mapper(value)) : parseNumber(value);
    return sum + num;
  }, 0);
} 