import { test as base } from "@playwright/test";
import { seedDatabase } from "$lib/server/db/seed";
import { assertTestDatabase, wipeDatabase } from "$lib/server/db/wipe";
import { e2eEnvironment } from "./environment";

/** Playwright's `test`, with the e2e database wiped and seeded before every test. */
export const test = base.extend<{ cleanDatabase: void }>({
  cleanDatabase: [
    async ({}, use) => {
      assertTestDatabase(e2eEnvironment.DATABASE_URL_TEST_E2E);
      await wipeDatabase(e2eEnvironment.DATABASE_URL_TEST_E2E);
      await seedDatabase(e2eEnvironment.DATABASE_URL_TEST_E2E);
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
