import { Suspense } from 'react';
import { SettlementsData } from '@/components/server/settlements/SettlementsData';
import { SettlementsClient } from '@/components/SettlementsClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export { metadata } from './metadata';

export default async function SettlementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* Server Component */}
        <SettlementsData />
        {/* Client Component */}
        <SettlementsClient />
      </Suspense>
    </div>
  );
}
