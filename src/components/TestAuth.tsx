'use client';

import { useEffect, useState } from 'react';
import useUserStore from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TestAuth() {
  const { user, isAuthenticated, isLoading, checkSession, logout } = useUserStore();
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        await checkSession();
        setSessionLoaded(true);
      } catch (error) {
        console.error('Error loading session:', error);
        setSessionLoaded(true);
      }
    };

    loadSession();
  }, [checkSession]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!sessionLoaded) {
    return <div>Loading authentication state...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>
          This component tests the authentication state
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium mb-2">Authentication Status</h3>
          <p>Is Authenticated: <span className={isAuthenticated ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {isAuthenticated ? "Yes" : "No"}
          </span></p>
          <p>Is Loading: {isLoading ? "Yes" : "No"}</p>
        </div>

        {isAuthenticated && user && (
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">User Information</h3>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <Button 
              variant="destructive" 
              className="mt-4" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="p-4 border rounded-md bg-blue-50">
            <p>You are not authenticated. Please log in.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
