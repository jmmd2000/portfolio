import { wipeDatabase } from "$lib/server/db/wipe";
import { env } from "$lib/server/env";

try {
  await wipeDatabase(env.DATABASE_URL_MIGRATE);
  console.log("Wiped every table.");
} catch (error) {
  console.error("Wipe failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
