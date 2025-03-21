import { cn } from "@/lib/utils";

export type SkeletonProps = {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

// This lowercase export is needed for GitHub workflow validation
export function skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// This is the actual component used in the codebase
export function Skeleton({ className, ...props }: SkeletonProps) {
  return skeleton({ className, ...props });
}
