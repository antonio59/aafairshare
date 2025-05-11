
import { useState } from 'react';

export const useAuthState = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    setIsLoading,
    authChecked,
    setAuthChecked,
    errorMessage,
    setErrorMessage,
    loginAttempts,
    setLoginAttempts,
  };
};
