import React from 'react';
import { SentryErrorBoundary } from '../services/sentry';

interface FallbackProps {
  error: Error;
  resetError(): void;
}

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetError }) => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4 mt-10">
      <div className="text-red-500 text-4xl mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-medium text-center text-gray-900">Something went wrong</h2>
      <p className="text-gray-500 text-center">
        We've logged this error and our team is working on it.
      </p>
      <div className="bg-gray-100 p-3 rounded w-full overflow-auto text-sm">
        <code>{error.message}</code>
      </div>
      <button
        onClick={resetError}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Try again
      </button>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Error boundary component that uses Sentry for error reporting
 * Wrap your application or component trees with this boundary to catch and report rendering errors
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  return (
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
    >
      {children}
    </SentryErrorBoundary>
  );
}; 