import { createLogger } from './logger';

// Create a logger for this module
const logger = createLogger('query-cache');

// Simple in-memory query cache
interface QueryCache {
  [key: string]: {
    data: any;
    timestamp: number;
    expiresAt: number;
  };
}

// Global query cache
const queryCache: QueryCache = {};

// Default TTL (time to live) for cached data: 2 minutes
const DEFAULT_CACHE_TTL = 2 * 60 * 1000;

/**
 * Set data in the query cache
 * 
 * @param key - Cache key or array of keys to use as path
 * @param data - Data to cache
 * @param ttl - Time to live in milliseconds (default: 2 minutes)
 */
export function setQueryCache(
  key: string | string[], 
  data: any, 
  ttl: number = DEFAULT_CACHE_TTL
): void {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;
  const now = Date.now();
  
  queryCache[cacheKey] = {
    data,
    timestamp: now,
    expiresAt: now + ttl
  };
  
  logger.debug(`Set cache for key "${cacheKey}" (expires in ${ttl}ms)`);
}

/**
 * Get data from the query cache
 * 
 * @param key - Cache key or array of keys to use as path
 * @returns Cached data or null if not found or expired
 */
export function getQueryCache(key: string | string[]): any | null {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;
  const cached = queryCache[cacheKey];
  
  if (!cached) {
    logger.debug(`Cache miss for key "${cacheKey}"`);
    return null;
  }
  
  const now = Date.now();
  
  if (now > cached.expiresAt) {
    logger.debug(`Cache expired for key "${cacheKey}"`);
    delete queryCache[cacheKey];
    return null;
  }
  
  logger.debug(`Cache hit for key "${cacheKey}"`);
  return cached.data;
}

/**
 * Check if a key exists in the cache and is not expired
 * 
 * @param key - Cache key or array of keys
 * @returns Whether the key exists and is valid
 */
export function hasQueryCache(key: string | string[]): boolean {
  const cacheKey = Array.isArray(key) ? key.join(':') : key;
  const cached = queryCache[cacheKey];
  
  if (!cached) {
    return false;
  }
  
  return Date.now() <= cached.expiresAt;
}

/**
 * Invalidate cache entries matching a prefix
 * 
 * @param keyPrefix - Key prefix or array of key parts to invalidate
 */
export function invalidateQueries(keyPrefix: string | string[]): void {
  const prefix = Array.isArray(keyPrefix) ? keyPrefix.join(':') : keyPrefix;
  
  let invalidatedCount = 0;
  
  Object.keys(queryCache).forEach(key => {
    if (key === prefix || key.startsWith(`${prefix}:`)) {
      delete queryCache[key];
      invalidatedCount++;
    }
  });
  
  logger.debug(`Invalidated ${invalidatedCount} cache entries with prefix "${prefix}"`);
}

/**
 * Clear the entire query cache
 */
export function clearQueryCache(): void {
  const count = Object.keys(queryCache).length;
  
  Object.keys(queryCache).forEach(key => {
    delete queryCache[key];
  });
  
  logger.debug(`Cleared all ${count} cache entries`);
}

/**
 * Get cache stats for debugging
 * 
 * @returns Cache statistics
 */
export function getQueryCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  keys: string[];
} {
  const now = Date.now();
  const keys = Object.keys(queryCache);
  
  const validEntries = keys.filter(key => queryCache[key].expiresAt > now).length;
  const expiredEntries = keys.length - validEntries;
  
  return {
    totalEntries: keys.length,
    validEntries,
    expiredEntries,
    keys
  };
} 