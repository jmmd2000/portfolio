import { test as base } from "@playwright/test";
import { seedDatabase } from "$lib/server/db/seed";
import { assertTestDatabase, wipeDatabase } from "$lib/server/db/wipe";
import { e2eEnvironment } from "./environment";

const blankImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

/**
 * Playwright's `test`, with the e2e database wiped and seeded before every test. Pages never reach other sites:
 * images get a blank image and everything else is refused, so a slow or broken site can't stall a test.
 */
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
  page: async ({ page }, use) => {
    await page.route(
      url => url.hostname !== "localhost",
      async route => {
        if (route.request().resourceType() === "image") {
          await route.fulfill({ contentType: "image/png", body: blankImage });
          return;
        }
        await route.abort();
      }
    );
    await use(page);
  },
});

export { expect } from "@playwright/test";
