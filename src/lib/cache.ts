/**
 * Simple in-memory cache system
 */

interface CacheItem<T> {
  value: T;
  expires: number;
  createdAt: number;
}

class Cache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      value,
      expires,
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    if (entries.length === 0) {
      return {
        size: 0,
        hitRate: 0,
        oldestEntry: 0,
        newestEntry: 0,
      };
    }

    const ages = entries.map(item => now - item.createdAt);
    const oldestEntry = Math.max(...ages);
    const newestEntry = Math.min(...ages);

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      oldestEntry,
      newestEntry,
    };
  }
}

// Create cache instances for different purposes
export const studentCache = new Cache();
export const applicationCache = new Cache();
export const generalCache = new Cache();

// Cache key generators
export const cacheKeys = {
  studentDashboard: (userId: string) => `student:dashboard:${userId}`,
  studentApplications: (userId: string, page: number = 1, limit: number = 10) => 
    `student:applications:${userId}:${page}:${limit}`,
  studentApplication: (applicationId: string) => `student:application:${applicationId}`,
  internships: (filters: string) => `internships:${filters}`,
  companies: (filters: string) => `companies:${filters}`,
};

// Cache decorator for functions
export function cached<T extends any[], R>(
  cache: Cache,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return function (fn: (...args: T) => Promise<R>) {
    return async (...args: T): Promise<R> => {
      const key = keyGenerator(...args);
      
      // Try to get from cache
      const cached = cache.get<R>(key);
      if (cached !== null) {
        return cached;
      }

      // Execute function and cache result
      const result = await fn(...args);
      cache.set(key, result, ttl);
      
      return result;
    };
  };
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  studentCache.cleanup();
  applicationCache.cleanup();
  generalCache.cleanup();
}, 5 * 60 * 1000);
