import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Applies every migration in `drizzle/` that hasn't run on this database yet.
 * `scripts/migrate.mjs` does the same in the production image, so keep the two in step.
 */
export async function migrateDatabase(databaseURL: string): Promise<void> {
  const client = postgres(databaseURL, { max: 1, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  } finally {
    await client.end();
  }
}
