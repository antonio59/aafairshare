// Simple test page for Next.js compatibility
import type { Metadata } from 'next';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Test Page | AA Fair Share',
  description: 'A test page for Next.js compatibility',
};

// Bypass the type checking for Next.js page props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TestPage(props: any) {
  const params = props.params || {};
  const searchParams = props.searchParams || {};
  return (
    <div>
      <h1>Test Page</h1>
      <pre>{JSON.stringify({ params, searchParams }, null, 2)}</pre>
    </div>
  );
}
