import { Skeleton } from '@/components/ui/skeleton';

// In Next.js 15, this shouldn't be statically generated
export const dynamic = 'force-dynamic';

export default function SettlementsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settlements</h1>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}