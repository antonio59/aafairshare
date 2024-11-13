import React, { useEffect } from 'react';
import { useUserStore } from './userStore';
import { useExpenseStore } from './expenseStore';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useUserStore(state => state.currentUser);
  const userInitialized = useUserStore(state => state.isInitialized);
  const setUserInitialized = useUserStore(state => state.setInitialized);
  const { initializeStore, initialized: expenseInitialized } = useExpenseStore();

  useEffect(() => {
    // Ensure user store is marked as initialized
    if (!userInitialized) {
      setUserInitialized(true);
    }
  }, [userInitialized, setUserInitialized]);

  useEffect(() => {
    let mounted = true;

    const initializeStores = async () => {
      // If no user or expense store is already initialized, we're done
      if (!currentUser || expenseInitialized) {
        return;
      }

      try {
        await initializeStore();
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      }
    };

    if (userInitialized) {
      initializeStores();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser, userInitialized, expenseInitialized, initializeStore]);

  return <>{children}</>;
};

export default StoreProvider;
