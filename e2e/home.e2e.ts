import { expect, test } from "./fixtures";

test("the home page shows my name", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("James Doyle");
});
