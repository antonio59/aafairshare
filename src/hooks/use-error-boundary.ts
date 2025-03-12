import { useCallback, useState } from 'react';

interface ErrorBoundaryState {
  error: Error | null;
  resetError: () => void;
}

export function useErrorBoundary(): ErrorBoundaryState {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { error, resetError };
} 