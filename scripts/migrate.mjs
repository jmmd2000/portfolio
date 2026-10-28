/**
 * Applies the migrations inside the production image. It is plain JavaScript with no dev
 * dependencies, because the image has neither tsx nor dotenv. Compose passes the environment in.
 * Running it again does nothing: drizzle records the migrations it has applied.
 * `src/lib/server/db/migrate.ts` does the same for the db scripts, so keep the two in step.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL_MIGRATE;
if (!url) {
  console.error("Set DATABASE_URL_MIGRATE to run migrations.");
  process.exit(1);
}

const client = postgres(url, { max: 1, onnotice: () => {} });

try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
