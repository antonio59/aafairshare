
import React from 'react';
import { validateLoginInputs, checkConnectionAndSupabase, loginWithEmailAndPassword } from '@/services/api/auth/authUtilities';

interface LoginHandlerProps {
  email: string;
  password: string;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
}

export const useLoginHandler = ({
  email,
  password,
  setIsLoading,
  setErrorMessage
}: LoginHandlerProps) => {
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const validationError = validateLoginInputs(email, password);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    // Check connection
    const connection = await checkConnectionAndSupabase();
    if (!connection.isConnected) {
      setErrorMessage(connection.error || "Connection error");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const result = await loginWithEmailAndPassword(email, password);
      
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      
      // Force a page reload for clean state - more reliable than navigation
      console.log("Redirecting to homepage");
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleLogin };
};
