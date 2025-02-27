import { Suspense } from 'react';
import { AuthStatus } from '@/components/server/auth/AuthStatus';
import { TestAuth } from '@/components/TestAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Authentication Test Page</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Client-Side Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <TestAuth />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Server-Side Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading server auth status...</div>}>
                <AuthStatus />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
