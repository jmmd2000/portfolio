interface RateLimiterOptions {
  /** How many attempts a key can record inside one window. */
  maxAttempts: number;
  /** How long an attempt counts against its key, in milliseconds. */
  windowMs: number;
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

export interface RateLimiter {
  /** Whether the key may make another attempt now. Checking never uses up an attempt. */
  check(key: string): RateLimitResult;
  /** Counts one attempt against the key. It never refuses anything, so call `check` first. */
  record(key: string): void;
  /** How many keys are being tracked. */
  trackedKeyCount(): number;
}

/**
 * An in-memory, sliding-window rate limiter. Each key keeps the times of its recent attempts, and an
 * attempt stops counting once it is older than the window.
 *
 * Callers key it on the client IP from `event.getClientAddress()`.
 */
export function createRateLimiter({ maxAttempts, windowMs }: RateLimiterOptions): RateLimiter {
  const attemptTimesByKey = new Map<string, number[]>();
  let lastClearTime = Date.now();

  function recentAttemptTimes(key: string, now: number): number[] {
    const attemptTimes = attemptTimesByKey.get(key) ?? [];
    return attemptTimes.filter(attemptTime => now - attemptTime < windowMs);
  }

  // Forget keys whose attempts have all expired, at most once per window
  function clearExpiredKeys(now: number): void {
    if (now - lastClearTime < windowMs) return;

    for (const key of attemptTimesByKey.keys()) {
      if (recentAttemptTimes(key, now).length === 0) {
        attemptTimesByKey.delete(key);
      }
    }
    lastClearTime = now;
  }

  return {
    check(key) {
      const now = Date.now();
      const attemptTimes = recentAttemptTimes(key, now);
      if (attemptTimes.length < maxAttempts) return { allowed: true };

      const oldestAttemptTime = attemptTimes[0];
      return { allowed: false, retryAfterMs: oldestAttemptTime + windowMs - now };
    },

    record(key) {
      const now = Date.now();
      clearExpiredKeys(now);
      attemptTimesByKey.set(key, [...recentAttemptTimes(key, now), now]);
    },

    trackedKeyCount() {
      return attemptTimesByKey.size;
    },
  };
}
