import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  expiry: number;
}

interface DataCacheResult<T> {
  data: T | null;
  updateCache: (newData: T) => void;
  loadData: <R = T>(fetchCallback: () => Promise<R>) => Promise<R | null>;
  clearCache: () => void;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isCacheExpired: () => boolean;
}

/**
 * Custom hook for caching data with localStorage persistence
 * 
 * @param key - The key to store the data under in localStorage
 * @param initialData - Initial data to use if no cached data exists
 * @param expiryMinutes - Cache expiration time in minutes (default: 30)
 * @returns Cache management functions and data
 */
export function useDataCache<T>(
  key: string,
  initialData: T | null = null,
  expiryMinutes: number = 30
): DataCacheResult<T> {
  // Initialize state from localStorage or with initial data
  const [data, setData] = useState<T | null>(() => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (item) {
        const parsedItem = JSON.parse(item) as CacheItem<T>;
        // Check if cache has expired
        if (parsedItem.expiry && parsedItem.expiry > Date.now()) {
          return parsedItem.data;
        } else {
          // Clear expired cache
          localStorage.removeItem(`cache_${key}`);
        }
      }
      return initialData;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return initialData;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Update cache in localStorage when data changes
  useEffect(() => {
    if (data !== null) {
      try {
        const expiry = Date.now() + expiryMinutes * 60 * 1000;
        localStorage.setItem(`cache_${key}`, JSON.stringify({ data, expiry }));
      } catch (error) {
        console.error('Error writing to cache:', error);
      }
    }
  }, [key, data, expiryMinutes]);

  /**
   * Update the cached data
   * @param newData - New data to cache
   */
  const updateCache = useCallback((newData: T): void => {
    setData(newData);
    setLastUpdated(new Date());
  }, []);

  /**
   * Load data using the provided callback and update cache
   * @param fetchCallback - Async function to fetch fresh data
   */
  const loadData = useCallback(async <R = T>(
    fetchCallback: () => Promise<R>
  ): Promise<R | null> => {
    if (!fetchCallback || typeof fetchCallback !== 'function') {
      const error = new Error('Invalid fetch callback provided');
      setError(error);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const freshData = await fetchCallback();
      updateCache(freshData as unknown as T);
      return freshData;
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [updateCache]);

  /**
   * Clears the cached data
   */
  const clearCache = useCallback((): void => {
    localStorage.removeItem(`cache_${key}`);
    setData(initialData);
    setLastUpdated(null);
  }, [key, initialData]);

  /**
   * Checks if the cache has expired
   * @returns Whether the cache has expired
   */
  const isCacheExpired = useCallback((): boolean => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return true;
      
      const { expiry } = JSON.parse(item) as CacheItem<T>;
      return !expiry || expiry < Date.now();
    } catch (error) {
      console.error('Error checking cache expiry:', error);
      return true;
    }
  }, [key]);

  return {
    data,
    updateCache,
    loadData,
    clearCache,
    isLoading,
    error,
    lastUpdated,
    isCacheExpired
  };
} 