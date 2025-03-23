'use client';

import React from 'react';
import { ReactElement, ErrorInfo } from 'react';


export interface ErrorBoundaryProps {
  children: ReactElement;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: { children: ReactElement }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error: Unable to load the resource. Please check your connection and try again.';
    } else if (error instanceof Response && error.status === 404) {
      errorMessage = 'Resource not found. Please try again later.';
    }
    
    return { hasError: true, errorMessage };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{this.state.errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}