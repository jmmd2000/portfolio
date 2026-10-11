import { expect, test } from "./fixtures";

test("the server marks the current page, before any JavaScript runs", async ({ page }) => {
  // Block the app's JavaScript, so only the server's HTML is tested
  await page.route("**/_app/**/*.js", route => route.abort());

  await page.goto("/");

  await expect(page.getByRole("navigation").getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
});
