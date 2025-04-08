import React, { Suspense, lazy, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy load the chart components
export const LazyEnhancedTrendChart = lazy(() => import('./EnhancedTrendChart'));
export const LazyEnhancedDataChart = lazy(() => import('./EnhancedDataChart'));

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
  return (
    <Suspense fallback={
      fallback || (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
      )
    }>
      <Component {...props} />
    </Suspense>
  );
}
