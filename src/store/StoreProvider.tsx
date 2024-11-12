import React, { useEffect, useState } from 'react';
import { useUserStore } from './userStore';
import { useExpenseStore } from './expenseStore';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const currentUser = useUserStore(state => state.currentUser);
  const { initializeStore, initialized: expenseInitialized } = useExpenseStore();

  useEffect(() => {
    let mounted = true;

    const initializeStores = async () => {
      if (!currentUser || expenseInitialized) {
        if (mounted) setIsInitialized(true);
        return;
      }

      try {
        await initializeStore();
        if (mounted) setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
        if (mounted) setIsInitialized(true);
      }
    };

    initializeStores();

    return () => {
      mounted = false;
    };
  }, [currentUser, initializeStore, expenseInitialized]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
