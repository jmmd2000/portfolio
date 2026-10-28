import { createRateLimiter } from "$lib/server/rateLimiter";

export const throwLimiter = createRateLimiter({ maxAttempts: 1, windowMs: 1000 });
