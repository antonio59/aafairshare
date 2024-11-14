import React, { useEffect } from 'react';
import { useUserStore } from './userStore';
import { useExpenseStore } from './expenseStore';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useUserStore(state => state.currentUser);
  const userInitialized = useUserStore(state => state.isInitialized);
  const setUserInitialized = useUserStore(state => state.setInitialized);
  const { initializeStore, initialized: expenseInitialized } = useExpenseStore();

  // Initialize user store immediately
  useEffect(() => {
    if (!userInitialized) {
      setUserInitialized(true);
    }
  }, [userInitialized, setUserInitialized]);

  // Initialize expense store only when user is available
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const initializeStores = async () => {
      if (!currentUser || expenseInitialized) {
        return;
      }

      try {
        await initializeStore();
      } catch (error) {
        console.error('Failed to initialize expense store:', error);
        
        // Retry logic
        if (retryCount < maxRetries && mounted) {
          retryCount++;
          console.log(`Retrying initialization (${retryCount}/${maxRetries})...`);
          setTimeout(initializeStores, retryDelay);
        }
      }
    };

    if (userInitialized && currentUser) {
      initializeStores();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser, userInitialized, expenseInitialized, initializeStore]);

  // Render children directly without any wrapping div
  return children;
};

export default StoreProvider;
