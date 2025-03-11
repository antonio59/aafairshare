import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error Boundary component to catch JavaScript errors in child components 
 * and display a fallback UI instead of crashing the whole application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error Boundary caught:', error, errorInfo);
    this.setState({ hasError: true });
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>Something went wrong. Please try refreshing the page.</span>
        </div>
      );
    }
    return this.props.children;
  }
} 