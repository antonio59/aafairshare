import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
      </p>
      <Link 
        href="/"
        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Return to Home
      </Link>
    </div>
  );
}
