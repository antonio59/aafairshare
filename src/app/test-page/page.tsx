// Simple test page for Next.js 15 compatibility
export default function TestPage({ 
  params,
  searchParams,
}: {
  params: {};
  searchParams: {};
}) {
  return (
    <div>
      <h1>Test Page</h1>
      <pre>{JSON.stringify({ params, searchParams }, null, 2)}</pre>
    </div>
  );
}
