import postgres from "postgres";
import { e2eEnvironment } from "./environment";
import { expect, test } from "./fixtures";

test("the footer leaves out the visitor count when it can't be read, and the page still loads", async ({ page }) => {
  await page.goto("/cv");
  await expect(page.locator("footer .visitors")).toBeVisible();

  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  try {
    await client`alter table counters rename to counters_unreachable`;
    const response = await page.reload();

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(page.locator("footer .visitors")).toHaveCount(0);
  } finally {
    await client`alter table counters_unreachable rename to counters`;
    await client.end();
  }
});
