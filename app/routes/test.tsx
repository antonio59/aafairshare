import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export function loader() {
  return json({
    message: "This is a test page",
    timestamp: new Date().toISOString(),
  });
}

export default function TestPage() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="p-8 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Test Page</h1>
      <p className="mb-4 text-gray-700 dark:text-gray-300">{data.message}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp: {data.timestamp}</p>
      
      <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Environment Check</h2>
        <ul className="space-y-2">
          <li className="text-gray-700 dark:text-gray-300">
            <strong>Client-side rendering:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}
          </li>
          <li className="text-gray-700 dark:text-gray-300">
            <strong>Window object:</strong> {typeof window !== 'undefined' ? 'Available' : 'Not available'}
          </li>
          <li className="text-gray-700 dark:text-gray-300">
            <strong>Document object:</strong> {typeof document !== 'undefined' ? 'Available' : 'Not available'}
          </li>
        </ul>
      </div>
      
      <button 
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}
