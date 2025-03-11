// Caching utilities
import { createLogger } from './logger';

// Create a logger for this module
const logger = createLogger('Cache');

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

/**
 * Simple in-memory cache with TTL
 */
class Cache<T> {
  private cache: Map<string, CacheItem<T>>;
  private ttl: number;

  /**
   * Create a new cache instance
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  constructor(ttl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Set a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   */
  set(key: string, value: T): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now()
    };
    this.cache.set(key, item);
    logger.info('Cache set', { key, size: this.cache.size });
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns Cached value or null if not found or expired
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      logger.info('Cache expired', { key });
      return null;
    }

    logger.info('Cache hit', { key });
    return item.value;
  }

  /**
   * Invalidate a specific cache entry
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    logger.info('Cache invalidated', { key });
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', { previousSize: size });
  }
}

// Create cache instances for different types of data
export const categoryCache = new Cache<string[]>();
export const locationsCache = new Cache<string[]>();
export const userCache = new Cache<Record<string, unknown>>();

/**
 * Cache wrapper function for async operations
 * @param cache - Cache instance to use
 * @param key - Cache key
 * @param fetchFn - Async function to fetch data if not cached
 * @returns Wrapped function that uses cache
 */
export const withCache = <T, Args extends unknown[]>(
  cache: Cache<T>,
  key: string,
  fetchFn: (...args: Args) => Promise<T>
) => async (...args: Args): Promise<T> => {
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData;
  }

  try {
    logger.info('Cache miss, fetching data', { key });
    const data = await fetchFn(...args);
    cache.set(key, data);
    return data;
  } catch (error) {
    logger.error('Error fetching data for cache', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}; 