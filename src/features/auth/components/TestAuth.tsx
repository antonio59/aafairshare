import React, { useState } from 'react';
import { testDirectConnection, testDirectAuth } from '../../../direct-test';

export default function TestAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnectionTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const success = await testDirectConnection();
      setResult({
        success,
        message: success 
          ? 'Connection test successful! Database query worked.' 
          : 'Connection test failed. Check console for details.'
      });
    } catch (err) {
      setResult({
        success: false,
        message: `Error: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const result = await testDirectAuth(email, password);
      setResult({
        success: result.success,
        message: result.success 
          ? 'Authentication successful! Check console for details.' 
          : `Authentication failed: ${result.error ? (result.error as any).message || 'Unknown error' : 'Unknown error'}`
      });
    } catch (err) {
      setResult({
        success: false,
        message: `Error: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Test</h2>
      
      <button
        onClick={handleConnectionTest}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>
      
      <div className="border-t my-4 pt-4">
        <h3 className="text-lg font-medium mb-3">Test Authentication</h3>
        <form onSubmit={handleAuthTest} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Authentication'}
          </button>
        </form>
      </div>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.message}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
} 