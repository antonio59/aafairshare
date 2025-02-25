import { Suspense } from 'react';
import { AnalyticsData } from '@/components/server/analytics/AnalyticsData';
import { AnalyticsClient } from '@/components/AnalyticsClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Analytics | AAFairShare',
  description: 'View detailed analytics and insights about your expenses',
};

export default async function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* Server Component */}
        <AnalyticsData timeRange="current" />
        {/* Client Component */}
        <AnalyticsClient />
      </Suspense>
    </div>
  );
}
