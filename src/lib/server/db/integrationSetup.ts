import { migrateDatabase } from "./migrate";
import { testEnvironment } from "./testEnvironment";
import { assertTestDatabase } from "./wipe";

/** Brings the integration test database up to date once, before any test runs. */
export default async function integrationSetup(): Promise<void> {
  assertTestDatabase(testEnvironment.DATABASE_URL_TEST);
  await migrateDatabase(testEnvironment.DATABASE_URL_TEST);
}
