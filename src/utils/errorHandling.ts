import { logError as loggerError } from './logger';

// Custom error types
export class DatabaseError extends Error {
  originalError: Error | null;

  constructor(message: string, originalError: Error | null = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

interface ErrorContext {
  timestamp?: string;
  functionName?: string;
  arguments?: string[];
  [key: string]: unknown;
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Error logging utility
export function logError(error: Error, context: ErrorContext = {}): void {
  // Extract additional context for logging
  const errorContext = {
    timestamp: new Date().toISOString(),
    ...context
  };

  // Log using our centralized logger
  loggerError('ErrorHandler', error, errorContext);
}

// Error handler wrapper for async functions
export function withErrorHandling<T>(
  fn: (...args: unknown[]) => Promise<T>,
  errorContext: ErrorContext = {}
): (...args: unknown[]) => Promise<T> {
  return async (...args: unknown[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error, { 
        functionName: fn.name || 'anonymous', 
        arguments: args.map(arg => 
          // Safely stringify arguments but avoid huge objects
          typeof arg === 'object' ? 'Object:' + (arg?.constructor?.name || 'Unknown') : String(arg)
        ),
        ...errorContext
      });
      throw error;
    }
  };
}

// Common error handler for API requests
export function handleApiError(error: ApiError, defaultMessage = 'An unexpected error occurred'): string {
  logError(error, { source: 'API' });
  
  // Return user-friendly error message
  if (error instanceof ValidationError) {
    return error.message;
  } else if (error instanceof DatabaseError) {
    return 'Database operation failed. Please try again.';
  } else if (error instanceof AuthenticationError) {
    return 'Authentication failed. Please log in again.';
  } else if (error?.response?.data?.message) {
    return error.response.data.message;
  } else if (error?.message) {
    return error.message;
  }
  
  return defaultMessage;
} 