'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. Please try again or contact support if the issue persists.
        </p>
        <Button
          onClick={() => reset()}
          className="mx-auto"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
