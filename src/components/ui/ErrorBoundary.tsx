'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (props: FallbackProps) => React.ReactNode;
}

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={fallback}
      onReset={(details) => {
        // Reset the state when the error boundary is reset
        console.log('Error boundary reset', details);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
