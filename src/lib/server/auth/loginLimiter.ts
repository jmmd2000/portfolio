import { createRateLimiter } from "$lib/server/rateLimiter";

export const loginLimiter = createRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
