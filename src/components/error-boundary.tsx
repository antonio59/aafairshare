'use client';

import React from 'react';
import { ReactElement, ErrorInfo } from 'react';

export class ErrorBoundary extends React.Component<{ children: ReactElement }, { hasError: boolean }> {
  constructor(props: { children: ReactElement }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
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