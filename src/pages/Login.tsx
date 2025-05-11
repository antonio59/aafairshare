
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/auth';
import ConnectionStatus from '@/components/auth/ConnectionStatus';
import LoginForm from '@/components/auth/LoginForm';
import LoadingState from '@/components/auth/LoadingState';

const Login = () => {
  const { toast } = useToast();
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    authChecked,
    connectionStatus,
    errorMessage,
    handleLogin
  } = useAuth();

  // Show loading state while checking auth
  if (!authChecked || connectionStatus === 'checking') {
    return <LoadingState />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">AAFairShare</h1>
          <p className="text-gray-600">Track and split expenses fairly</p>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Sign in to access your shared expenses</CardDescription>
              </div>
              
              <ConnectionStatus 
                connectionStatus={connectionStatus}
                errorMessage={null}
              />
            </div>
          </CardHeader>
          <CardContent>
            <LoginForm 
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
              connectionStatus={connectionStatus}
              handleSubmit={handleLogin}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
