import React, { Component, ReactNode } from 'react';
// Removed unused useToast import
// import { useToast } from '@/hooks/use-toast'; 

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Consider using a logging service instead of console.error in production
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Example: logErrorToMyService(error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
          <p className="mt-2 text-sm text-red-700">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return children;
  }
}

// Helper function to get component display name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDisplayName(WrappedComponent: React.ComponentType<any>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// Updated HOC with displayName and improved props typing
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  // Assign a display name for React DevTools
  ComponentWithErrorBoundary.displayName = `WithErrorBoundary(${getDisplayName(WrappedComponent)})`;

  return ComponentWithErrorBoundary;
};


export default ErrorBoundary;
