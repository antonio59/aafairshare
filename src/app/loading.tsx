import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
