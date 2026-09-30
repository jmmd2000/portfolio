import { createRateLimiter } from "$lib/server/rateLimiter";

/** Failed logins: 5 per IP per 15 mins */
export const loginLimiter = createRateLimiter({ maxAttempts: 5, windowMs: 15 * 60 * 1000 });
