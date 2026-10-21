import { expect, test } from "./fixtures";

test("a missing page returns a 404 status", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
});

test("a missing page under a nav page doesn't mark that page as current", async ({ page }) => {
  await page.goto("/projects/this-project-does-not-exist");

  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects" })).not.toHaveAttribute("aria-current");
});
