'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-red-600">
              Something went wrong
            </h1>
            <p className="mb-6 text-gray-600">
              We apologize for the inconvenience. The application encountered a critical error.
            </p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
