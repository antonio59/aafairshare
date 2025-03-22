'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface SettlementSkeletonProps {
  className?: string;
}

export function SettlementSkeleton({ className }: SettlementSkeletonProps) {
  return (
    <Card className={cn("w-full overflow-hidden", className)} data-testid="card">
      <CardHeader className="pb-2 space-y-2">
        <Skeleton className="h-6 w-48" role="status" />
        <Skeleton className="h-4 w-36" role="status" />
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-muted/50 p-4 rounded-lg space-y-3">
              <Skeleton className="h-5 w-36" role="status" />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" role="status" />
                  <Skeleton className="h-4 w-16" role="status" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg space-y-3">
          <Skeleton className="h-5 w-32" role="status" />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" role="status" />
              <Skeleton className="h-4 w-4 rounded-full" role="status" />
              <Skeleton className="h-4 w-20" role="status" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" role="status" />
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <Skeleton className="h-10 w-full" role="status" />
        </div>
      </CardContent>
    </Card>
  );
}

export interface SettlementSkeletonGroupProps {
  count?: number;
  className?: string;
}

export function SettlementSkeletonGroup({ count = 2, className }: SettlementSkeletonGroupProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SettlementSkeleton key={index} className={`animate-pulse-delayed-${index % 3}`} />
      ))}
    </div>
  );
}
