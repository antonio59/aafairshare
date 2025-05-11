
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/auth';
import ConnectionStatus from '@/components/auth/ConnectionStatus';
import LoginForm from '@/components/auth/LoginForm';
import LoadingState from '@/components/auth/LoadingState';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cleanupAuthState } from '@/integrations/supabase/client';

const Login = () => {
  const { toast } = useToast();
  const [resetInProgress, setResetInProgress] = useState(false);
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

  // Handle auth reset
  const handleAuthReset = () => {
    setResetInProgress(true);
    try {
      // Clean up all auth tokens
      cleanupAuthState();
      toast({
        title: "Authentication reset",
        description: "Auth state has been reset. Please try logging in again.",
      });
    } catch (error) {
      console.error("Error resetting auth:", error);
    } finally {
      setResetInProgress(false);
    }
  };

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
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to access your shared expenses</CardDescription>
            <div className="mt-2">
              <ConnectionStatus 
                connectionStatus={connectionStatus}
                errorMessage={errorMessage}
              />
            </div>
          </CardHeader>
          <CardContent>
            <LoginForm 
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading || resetInProgress}
              connectionStatus={connectionStatus}
              handleSubmit={handleLogin}
            />
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="w-full pt-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleAuthReset}
                disabled={isLoading || resetInProgress}
              >
                Reset Authentication State
              </Button>
            </div>
            
            <div className="mt-4 w-full">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Having trouble?</AlertTitle>
                <AlertDescription>
                  If you're having issues logging in, try resetting the authentication state using the button above, then try again.
                </AlertDescription>
              </Alert>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
