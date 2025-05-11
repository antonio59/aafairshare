
import { AlertCircle, Check, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EmailStatusProps {
  isSupabaseReady: boolean;
  isLoadingUsers: boolean;
  isSending: boolean;
  success: boolean;
  errorDetails: string | null;
  errorTrace: string | null;
  onRetryConnection: () => void;
}

export const EmailStatus = ({
  isSupabaseReady,
  isLoadingUsers,
  isSending,
  success,
  errorDetails,
  errorTrace,
  onRetryConnection,
}: EmailStatusProps) => {
  return (
    <>
      {!isSupabaseReady ? (
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
            <span>Initializing Supabase connection...</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetryConnection}
            className="mt-2"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Retry Connection
          </Button>
        </div>
      ) : isLoadingUsers ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {errorDetails && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error details:</p>
              <p className="mt-1">{errorDetails}</p>
              
              {errorTrace && (
                <div className="mt-2">
                  <p className="font-semibold">Debug information:</p>
                  <pre className="mt-1 text-xs overflow-auto max-h-32 p-2 bg-red-100 rounded">
                    {errorTrace}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
