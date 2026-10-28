import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { accounts, sessions, users, verifications } from "$lib/server/db/schema";
import { env } from "$lib/server/env";

// Any schema, the app passes its full schema, the admin scripts pass none
type Database = PgDatabase<PostgresJsQueryResultHKT, Record<string, unknown>>;

/**
 * better-auths settings, shared by the app and the admin scripts. There is one admin and no email,
 * so signup is off and nothing is ever sent. better-auths own rate limiter is off because login
 * uses the shared rate limiter instead, keyed on the same client IP as everything else.
 */
export function authOptions(database: Database) {
  return {
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(database, {
      provider: "pg",
      usePlural: true,
      schema: { users, sessions, accounts, verifications },
    }),
    emailAndPassword: { enabled: true, disableSignUp: true },
    rateLimit: { enabled: false },
    telemetry: { enabled: false },
  } satisfies BetterAuthOptions;
}
