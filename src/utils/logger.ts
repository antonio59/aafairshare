/**
 * Logger utility - Handles logging in a consistent way with environment-based filtering
 * Only logs in development mode and not in production
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (error: Error | string, ...args: unknown[]) => void;
}

/**
 * Log information to the console (development only)
 * @param context - The context where the log is coming from
 * @param args - Arguments to log
 */
export const logInfo = (context: string, ...args: unknown[]): void => {
  if (!isDevelopment) return;
  console.log(`[${context}]`, ...args);
};

/**
 * Log warnings to the console (development only)
 * @param context - The context where the warning is coming from
 * @param args - Arguments to log
 */
export const logWarning = (context: string, ...args: unknown[]): void => {
  if (!isDevelopment) return;
  console.warn(`[${context}]`, ...args);
};

/**
 * Log errors to the console (always logged)
 * @param context - The context where the error is coming from
 * @param error - The error object or message
 * @param args - Additional arguments to log
 */
export const logError = (context: string, error: Error | string, ...args: unknown[]): void => {
  // We log errors in all environments for debugging purposes
  const errorMessage = error instanceof Error ? error.message : error;
  console.error(`[${context}]`, errorMessage, ...args);
  
  // In development, log the full error stack if available
  if (isDevelopment && error instanceof Error && error.stack) {
    console.error(error.stack);
  }
};

/**
 * Logger instance with methods for different log levels
 * @param context - The logging context (component/module name)
 */
export const createLogger = (context: string): Logger => ({
  info: (...args: unknown[]) => logInfo(context, ...args),
  warn: (...args: unknown[]) => logWarning(context, ...args),
  error: (error: Error | string, ...args: unknown[]) => logError(context, error, ...args),
});

export default createLogger; 