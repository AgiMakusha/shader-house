/**
 * PERFORMANCE FIX: Simple in-memory cache for API responses
 * 
 * Caches public data (featured/trending games) to reduce database load
 * Cache is invalidated after TTL expires
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache is still valid
    if (age > entry.ttl) {
      // Cache expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clear expired entries (cleanup)
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const apiCache = new APICache();

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  FEATURED_GAMES: 5 * 60 * 1000,    // 5 minutes
  TRENDING_GAMES: 10 * 60 * 1000,   // 10 minutes
  TAGS: 15 * 60 * 1000,             // 15 minutes
  PUBLIC_GAMES: 2 * 60 * 1000,      // 2 minutes
} as const;

// Cache key generators
export const CACHE_KEYS = {
  featuredGames: (limit: number) => `featured-games-${limit}`,
  trendingGames: (limit: number, period: number) => `trending-games-${limit}-${period}`,
  tags: () => 'tags-all',
  publicGames: (query: string) => `public-games-${query}`,
} as const;

// Cleanup interval (run every 5 minutes)
if (typeof window === 'undefined') {
  // Only run cleanup on server
  setInterval(() => {
    apiCache.clearExpired();
  }, 5 * 60 * 1000);
}

