
import { NavigateFunction } from 'react-router-dom';
import { useSessionCheck } from './useSessionCheck';
import { useLoginHandler } from './useLoginHandler';

interface AuthActionsProps {
  email: string;
  password: string;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (message: string | null) => void;
  setAuthChecked: (checked: boolean) => void;
}

export const useAuthActions = ({
  email,
  password,
  setIsLoading,
  setErrorMessage,
  setAuthChecked
}: AuthActionsProps) => {
  
  // Use the extracted session check hook
  const { checkSession } = useSessionCheck({
    setErrorMessage,
    setAuthChecked
  });
  
  // Use the extracted login handler hook
  const { handleLogin } = useLoginHandler({
    email,
    password,
    setIsLoading,
    setErrorMessage
  });
  
  return {
    checkSession,
    handleLogin
  };
};
