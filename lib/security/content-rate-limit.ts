/**
 * Content Rate Limiting
 * Limits how often users can post content (threads, comments, reviews, etc.)
 */

interface ContentRateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory store for content rate limits
// Key format: `{contentType}:{userId}`
const contentRateLimitStore = new Map<string, ContentRateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of contentRateLimitStore.entries()) {
    // Remove entries older than 24 hours
    if (now - entry.windowStart > 24 * 60 * 60 * 1000) {
      contentRateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Content type rate limit configurations
 */
export const CONTENT_RATE_LIMITS = {
  // Threads: 3 per hour, 10 per day
  thread: {
    hourly: { max: 3, windowMs: 60 * 60 * 1000 },
    daily: { max: 10, windowMs: 24 * 60 * 60 * 1000 },
  },
  // Posts/Comments: 10 per 15 minutes, 50 per hour
  post: {
    shortTerm: { max: 10, windowMs: 15 * 60 * 1000 },
    hourly: { max: 50, windowMs: 60 * 60 * 1000 },
  },
  // Reviews: 5 per day
  review: {
    daily: { max: 5, windowMs: 24 * 60 * 60 * 1000 },
  },
  // Devlog comments: 15 per hour
  devlogComment: {
    hourly: { max: 15, windowMs: 60 * 60 * 1000 },
  },
  // Reports: 10 per day (prevent report spam)
  report: {
    daily: { max: 10, windowMs: 24 * 60 * 60 * 1000 },
  },
  // Tips: 20 per day
  tip: {
    daily: { max: 20, windowMs: 24 * 60 * 60 * 1000 },
  },
  // Beta feedback: 20 per day
  betaFeedback: {
    daily: { max: 20, windowMs: 24 * 60 * 60 * 1000 },
  },
} as const;

export type ContentType = keyof typeof CONTENT_RATE_LIMITS;

export interface ContentRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
  limitType: string;
}

/**
 * Check if user can post content of a specific type
 */
export function checkContentRateLimit(
  userId: string,
  contentType: ContentType
): ContentRateLimitResult {
  const now = Date.now();
  const limits = CONTENT_RATE_LIMITS[contentType];

  // Check all limit windows for this content type
  for (const [limitType, config] of Object.entries(limits)) {
    const key = `${contentType}:${limitType}:${userId}`;
    const entry = contentRateLimitStore.get(key);

    if (!entry || now - entry.windowStart >= config.windowMs) {
      // Window expired or doesn't exist - reset
      contentRateLimitStore.set(key, { count: 0, windowStart: now });
      continue;
    }

    // Check if limit exceeded
    if (entry.count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.windowStart + config.windowMs,
        limit: config.max,
        limitType,
      };
    }
  }

  // All limits passed
  const primaryLimit = Object.entries(limits)[0];
  const [limitType, config] = primaryLimit;
  const key = `${contentType}:${limitType}:${userId}`;
  const entry = contentRateLimitStore.get(key);

  return {
    allowed: true,
    remaining: config.max - (entry?.count || 0) - 1,
    resetAt: (entry?.windowStart || now) + config.windowMs,
    limit: config.max,
    limitType,
  };
}

/**
 * Record that a user posted content
 * Call this AFTER successfully creating content
 */
export function recordContentPost(
  userId: string,
  contentType: ContentType
): void {
  const now = Date.now();
  const limits = CONTENT_RATE_LIMITS[contentType];

  for (const [limitType, config] of Object.entries(limits)) {
    const key = `${contentType}:${limitType}:${userId}`;
    const entry = contentRateLimitStore.get(key);

    if (!entry || now - entry.windowStart >= config.windowMs) {
      // New window
      contentRateLimitStore.set(key, { count: 1, windowStart: now });
    } else {
      // Increment existing window
      entry.count++;
      contentRateLimitStore.set(key, entry);
    }
  }
}

/**
 * Get all rate limit status for a user
 * Useful for displaying in UI
 */
export function getUserContentLimits(userId: string): Record<ContentType, {
  canPost: boolean;
  limits: Array<{
    type: string;
    remaining: number;
    resetAt: number;
    max: number;
  }>;
}> {
  const now = Date.now();
  const result: any = {};

  for (const [contentType, limits] of Object.entries(CONTENT_RATE_LIMITS)) {
    const limitStatuses: any[] = [];
    let canPost = true;

    for (const [limitType, config] of Object.entries(limits)) {
      const key = `${contentType}:${limitType}:${userId}`;
      const entry = contentRateLimitStore.get(key);

      let remaining = config.max;
      let resetAt = now + config.windowMs;

      if (entry && now - entry.windowStart < config.windowMs) {
        remaining = Math.max(0, config.max - entry.count);
        resetAt = entry.windowStart + config.windowMs;
        if (remaining === 0) {
          canPost = false;
        }
      }

      limitStatuses.push({
        type: limitType,
        remaining,
        resetAt,
        max: config.max,
      });
    }

    result[contentType] = {
      canPost,
      limits: limitStatuses,
    };
  }

  return result;
}

/**
 * Format time until reset for display
 */
export function formatResetTime(resetAt: number): string {
  const now = Date.now();
  const diff = resetAt - now;

  if (diff <= 0) return 'now';

  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

/**
 * Cooldown check between posts (minimum time between consecutive posts)
 */
const lastPostTimes = new Map<string, number>();

// Minimum seconds between posts by content type
const POST_COOLDOWNS: Record<ContentType, number> = {
  thread: 60, // 1 minute between threads
  post: 10, // 10 seconds between comments
  review: 30, // 30 seconds between reviews
  devlogComment: 10, // 10 seconds between devlog comments
  report: 30, // 30 seconds between reports
  tip: 5, // 5 seconds between tips
  betaFeedback: 30, // 30 seconds between feedback
};

/**
 * Check if user must wait before posting (cooldown)
 */
export function checkCooldown(
  userId: string,
  contentType: ContentType
): { canPost: boolean; waitSeconds: number } {
  const key = `${contentType}:${userId}`;
  const lastPost = lastPostTimes.get(key);
  const now = Date.now();
  const cooldownMs = POST_COOLDOWNS[contentType] * 1000;

  if (!lastPost) {
    return { canPost: true, waitSeconds: 0 };
  }

  const elapsed = now - lastPost;
  if (elapsed >= cooldownMs) {
    return { canPost: true, waitSeconds: 0 };
  }

  const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
  return { canPost: false, waitSeconds };
}

/**
 * Record post time for cooldown tracking
 */
export function recordPostTime(userId: string, contentType: ContentType): void {
  const key = `${contentType}:${userId}`;
  lastPostTimes.set(key, Date.now());
}

// Cleanup old cooldown entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxCooldown = Math.max(...Object.values(POST_COOLDOWNS)) * 1000;
  
  for (const [key, time] of lastPostTimes.entries()) {
    if (now - time > maxCooldown * 2) {
      lastPostTimes.delete(key);
    }
  }
}, 5 * 60 * 1000);



