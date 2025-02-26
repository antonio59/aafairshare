'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);
  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if window.env exists and has the required variables
    if (typeof window !== 'undefined') {
      setEnvVariables({
        'window.env exists': window.env ? 'Yes' : 'No',
        'window.env.NEXT_PUBLIC_SUPABASE_URL': window.env?.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        'window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': window.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set',
        'process.env.NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set',
      });
    }

    // Test Supabase connection
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // Get the Supabase URL from the client
      const config = (supabase as any).config;
      setSupabaseUrl(config?.url || 'Could not retrieve URL');

      // Try to make a simple query to test the connection
      const { data, error } = await supabase.from('expenses').select('count(*)').limit(1);
      
      if (error) {
        setStatus('error');
        setErrorDetails(error.message);
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setErrorDetails(err instanceof Error ? err.message : String(err));
    }
  };

  const retryConnection = () => {
    setStatus('loading');
    setErrorDetails(null);
    testSupabaseConnection();
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>
            Testing the connection to your Supabase instance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Connection Status</h3>
              <div className="mt-2">
                {status === 'loading' && <p>Testing connection...</p>}
                {status === 'success' && (
                  <p className="text-green-600 font-medium">
                    ✅ Connection successful! Your Supabase client is working correctly.
                  </p>
                )}
                {status === 'error' && (
                  <div>
                    <p className="text-red-600 font-medium">
                      ❌ Connection failed!
                    </p>
                    {errorDetails && (
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                        {errorDetails}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium">Supabase URL</h3>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                {supabaseUrl || 'Not available'}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium">Environment Variables</h3>
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                <table className="w-full">
                  <tbody>
                    {Object.entries(envVariables).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-200">
                        <td className="py-2 pr-4 font-mono">{key}</td>
                        <td className="py-2">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={retryConnection}>
            Retry Connection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
