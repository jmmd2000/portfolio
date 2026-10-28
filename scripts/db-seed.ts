import { seedDatabase } from "$lib/server/db/seed";
import { env } from "$lib/server/env";

try {
  const result = await seedDatabase(env.DATABASE_URL_MIGRATE);

  if (result.seededTables.length > 0) {
    console.log(`Seeded ${result.seededTables.join(", ")}.`);
  }

  if (result.skippedTables.length > 0) {
    console.log(`Left ${result.skippedTables.join(", ")} alone`);
  }
} catch (error) {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
