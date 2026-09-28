import { expect, test } from "./fixtures";

test("a missing page returns a 404 status", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
});
