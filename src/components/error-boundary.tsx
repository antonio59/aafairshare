'use client';

import React from 'react';
import { ReactElement, ErrorInfo } from 'react';
import { cn } from '@/lib/utils';

export interface ErrorBoundaryProps {
  children: ReactElement;
}

export interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: { children: ReactElement }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Something went wrong. Please try again.</div>;
    }

    return this.props.children;
  }
}