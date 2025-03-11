import { createLogger } from './logger';

const logger = createLogger('RetryUtils');

interface RetryOptions {
  maxAttempts?: number;
  maxDelay?: number;
  onRetry?: ((retryCount: number, error: Error) => void) | undefined;
  shouldRetry?: ((error: Error) => boolean) | undefined;
}

interface TimeoutRef {
  [key: string]: NodeJS.Timeout | null;
}

/**
 * Calculates delay for exponential backoff
 * @param {number} retryCount - Current retry attempt
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} - Delay in milliseconds
 */
export function calculateBackoffDelay(retryCount: number, maxDelay: number = 5000): number {
  return Math.min(1000 * Math.pow(2, retryCount), maxDelay);
}

/**
 * Safely cleans up a timeout
 * @param {TimeoutRef} ref - Reference object containing timeout
 * @param {string} timeoutKey - Key for the timeout in the ref object
 */
export function cleanupTimeout(ref: TimeoutRef, timeoutKey: string): void {
  if (ref[timeoutKey]) {
    clearTimeout(ref[timeoutKey]!);
    ref[timeoutKey] = null;
  }
}

/**
 * Creates a retry wrapper for async functions
 * @param {() => Promise<T>} operation - Async function to retry
 * @param {RetryOptions} options - Retry options
 * @returns {Promise<T>} - Operation result
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  {
    maxAttempts = 3,
    maxDelay = 5000,
    onRetry = undefined,
    shouldRetry = undefined
  }: RetryOptions = {}
): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      
      if (retryCount === maxAttempts || (shouldRetry && !shouldRetry(error as Error))) {
        throw error;
      }

      const delay = calculateBackoffDelay(retryCount, maxDelay);
      logger.warn(`Attempt ${retryCount} failed, retrying in ${delay}ms`);
      
      if (onRetry) {
        onRetry(retryCount, error as Error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // TypeScript requires this even though it's unreachable
  throw new Error('Maximum retry attempts reached');
} 