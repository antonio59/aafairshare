import { Suspense } from 'react';
import { SettingsData } from '@/components/server/settings/SettingsData';
import { SettingsClient } from '@/components/SettingsClient';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = {
  title: 'Settings | AAFairShare',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* Server Component */}
        <SettingsData />
        {/* Client Component */}
        <SettingsClient />
      </Suspense>
    </div>
  );
}
