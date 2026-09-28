import { expect, test } from "./fixtures";

test("the pre-paint script applies a saved theme on its own", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  // Block the app's JavaScript, so only the inline script in app.html can set the theme
  await page.route("**/_app/**/*.js", route => route.abort());

  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("the theme choice survives a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});
