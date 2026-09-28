import { migrateDatabase } from "$lib/server/db/migrate";
import { wipeDatabase } from "$lib/server/db/wipe";
import { env } from "$lib/server/env";

try {
  await wipeDatabase(env.DATABASE_URL_MIGRATE);
  await migrateDatabase(env.DATABASE_URL_MIGRATE);
  console.log("Wiped every table and applied migrations.");
} catch (error) {
  console.error("Reset failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
