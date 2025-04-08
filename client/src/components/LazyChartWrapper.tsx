import React, { Suspense, lazy, ComponentType, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy load the chart components with explicit chunk names for better control
export const LazyEnhancedTrendChart = lazy(() =>
  import(/* webpackChunkName: "trend-chart" */ './EnhancedTrendChart')
);
export const LazyEnhancedDataChart = lazy(() =>
  import(/* webpackChunkName: "data-chart" */ './EnhancedDataChart')
);

interface LazyChartWrapperProps {
  title: string;
  component: ComponentType<any>;
  props: any;
  fallback?: React.ReactNode;
}

export default function LazyChartWrapper({
  title,
  component: Component,
  props,
  fallback
}: LazyChartWrapperProps) {
  // State to track if DOM is ready
  const [isDomReady, setIsDomReady] = useState(false);

  // Wait for DOM to be fully loaded
  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsDomReady(true);
    } else {
      const handleDomContentLoaded = () => setIsDomReady(true);
      document.addEventListener('DOMContentLoaded', handleDomContentLoaded);
      window.addEventListener('load', handleDomContentLoaded);

      // Cleanup
      return () => {
        document.removeEventListener('DOMContentLoaded', handleDomContentLoaded);
        window.removeEventListener('load', handleDomContentLoaded);
      };
    }
  }, []);

  // Default fallback UI
  const defaultFallback = (
    <Card className="border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-md" />
      </CardContent>
    </Card>
  );

  // If DOM is not ready yet, show fallback
  if (!isDomReady) {
    return fallback || defaultFallback;
  }

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <ErrorBoundaryWrapper>
        <Component {...props} />
      </ErrorBoundaryWrapper>
    </Suspense>
  );
}

// Simple error boundary wrapper
class ErrorBoundaryWrapper extends React.Component<{children: React.ReactNode}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Chart rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 dark:border-red-800 rounded bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">Failed to load chart. Please try switching to table view.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
