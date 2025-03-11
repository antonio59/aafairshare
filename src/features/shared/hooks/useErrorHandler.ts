import { useState, useCallback } from 'react';
import { logError } from '../../../utils/errorHandling';

interface ErrorHandlerOptions {
  context?: string;
}

interface WithErrorHandlingOptions {
  loadingState?: boolean;
  errorMessage?: string | null;
}

interface ErrorResponse {
  status?: number;
  message?: string;
}

interface CustomError extends Error {
  code?: string;
  response?: ErrorResponse;
}

interface ErrorHandlerResult {
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (err: CustomError, customMessage?: string | null) => void;
  withErrorHandling: <T>(asyncFunction: () => Promise<T>, options?: WithErrorHandlingOptions) => Promise<T>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

/**
 * Custom hook for consistent error handling across components
 * @param options - Configuration options
 * @returns Error handling utilities
 */
export const useErrorHandler = ({ context = 'component' }: ErrorHandlerOptions = {}): ErrorHandlerResult => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle an error consistently
   * @param err - The error object
   * @param customMessage - Optional custom message to display instead of the error message
   */
  const handleError = useCallback((err: CustomError, customMessage: string | null = null): void => {
    // Log the error
    logError(err, { context });
    
    // Set a user-friendly error message
    if (err?.response?.status === 401 || err?.code === 'UNAUTHENTICATED') {
      setError('Session expired. Please log in again.');
    } else if (err?.response?.status === 403 || err?.code === 'FORBIDDEN') {
      setError('You don\'t have permission to perform this action.');
    } else if (err?.response?.status === 404 || err?.code === 'NOT_FOUND') {
      setError('The requested resource was not found.');
    } else if (err?.response?.status === 500 || err?.code === 'SERVER_ERROR') {
      setError('An internal server error occurred. Please try again later.');
    } else if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('network')) {
      setError('Network error. Please check your connection and try again.');
    } else {
      setError(customMessage || err?.message || 'An unexpected error occurred.');
    }
  }, [context]);

  /**
   * Clear any existing errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Wrapper for async functions with automatic loading state and error handling
   * @param asyncFunction - The async function to wrap
   * @param options - Options for error handling
   * @returns The result of the async function
   */
  const withErrorHandling = useCallback(async function<T>(
    asyncFunction: () => Promise<T>,
    options: WithErrorHandlingOptions = {}
  ): Promise<T> {
    const { loadingState = true, errorMessage = null } = options;
    
    try {
      if (loadingState) setIsLoading(true);
      clearError();
      return await asyncFunction();
    } catch (err) {
      handleError(err as CustomError, errorMessage);
      throw err;
    } finally {
      if (loadingState) setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    withErrorHandling,
    isLoading,
    setIsLoading
  };
}; 