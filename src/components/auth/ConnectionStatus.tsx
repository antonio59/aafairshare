
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  connectionStatus: 'checking' | 'online' | 'offline';
  errorMessage: string | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionStatus,
  errorMessage
}) => {
  return (
    <>
      {connectionStatus === 'offline' && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {!errorMessage && connectionStatus === 'online' && (
        <div className="text-sm flex items-center gap-1 text-green-600">
          <Wifi className="h-4 w-4" />
          <span>Connected to server</span>
        </div>
      )}
    </>
  );
};

export default ConnectionStatus;
