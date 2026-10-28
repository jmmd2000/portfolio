import { migrateDatabase } from "$lib/server/db/migrate";
import { e2eEnvironment } from "./environment";

/** Brings the e2e database up to date once, before any test runs. */
export default async function globalSetup(): Promise<void> {
  await migrateDatabase(e2eEnvironment.DATABASE_URL_TEST_E2E);
}
