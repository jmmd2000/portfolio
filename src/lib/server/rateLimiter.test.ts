import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rateLimiter";

const windowMs = 15 * 60 * 1000;

function recordAttempts(limiter: ReturnType<typeof createRateLimiter>, key: string, count: number): void {
  for (let attempt = 0; attempt < count; attempt++) {
    limiter.record(key);
  }
}

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows attempts up to the limit, then blocks the next one", () => {
    const limiter = createRateLimiter({ maxAttempts: 5, windowMs });

    recordAttempts(limiter, "1.2.3.4", 4);
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });

    limiter.record("1.2.3.4");
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: false, retryAfterMs: windowMs });
  });

  it("unblocks exactly when the oldest attempt leaves the window", () => {
    const limiter = createRateLimiter({ maxAttempts: 5, windowMs });
    limiter.record("1.2.3.4");
    vi.advanceTimersByTime(60_000);
    recordAttempts(limiter, "1.2.3.4", 4);

    vi.advanceTimersByTime(windowMs - 60_000 - 1);
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: false, retryAfterMs: 1 });

    vi.advanceTimersByTime(1);
    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
  });

  it("counts each key separately", () => {
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs });

    limiter.record("1.2.3.4");

    expect(limiter.check("1.2.3.4").allowed).toBe(false);
    expect(limiter.check("5.6.7.8").allowed).toBe(true);
  });

  it("never uses up an attempt by checking", () => {
    const limiter = createRateLimiter({ maxAttempts: 1, windowMs });

    for (let check = 0; check < 10; check++) {
      limiter.check("1.2.3.4");
    }

    expect(limiter.check("1.2.3.4")).toEqual({ allowed: true });
  });

  it("forgets keys once all their attempts have expired", () => {
    const limiter = createRateLimiter({ maxAttempts: 5, windowMs });
    limiter.record("1.2.3.4");
    limiter.record("5.6.7.8");

    vi.advanceTimersByTime(windowMs);
    limiter.record("9.9.9.9");

    expect(limiter.trackedKeyCount()).toBe(1);
  });
});
