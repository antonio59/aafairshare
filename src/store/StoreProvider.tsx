import React, { useEffect, useState } from 'react';
import { useUserStore } from './userStore';
import { useExpenseStore } from './expenseStore';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const currentUser = useUserStore(state => state.currentUser);
  const userInitialized = useUserStore(state => state.isInitialized);
  const { initializeStore, initialized: expenseInitialized } = useExpenseStore();

  useEffect(() => {
    let mounted = true;

    const initializeStores = async () => {
      // Wait for user store to be initialized first
      if (!userInitialized) {
        if (mounted) setIsInitialized(false);
        return;
      }

      // If no user or expense store is already initialized, we're done
      if (!currentUser || expenseInitialized) {
        if (mounted) setIsInitialized(true);
        return;
      }

      try {
        await initializeStore();
        if (mounted) setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
        // Even on error, we mark as initialized to prevent infinite loading
        if (mounted) setIsInitialized(true);
      }
    };

    initializeStores();

    return () => {
      mounted = false;
    };
  }, [currentUser, userInitialized, expenseInitialized, initializeStore]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Wrap children in a div that ensures full height and background color
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default StoreProvider;
