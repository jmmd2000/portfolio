import { expect, test } from "./fixtures";

test("the server marks the current page, before any JavaScript runs", async ({ page }) => {
  // Block the app's JavaScript, so only the server's HTML is tested
  await page.route("**/_app/**/*.js", route => route.abort());

  await page.goto("/");

  await expect(page.getByRole("navigation").getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
});

test("with reduced motion, content shows straight away and never starts hidden", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const style = await page.locator("main").evaluate(element => {
    const computed = getComputedStyle(element);
    return { animationName: computed.animationName, opacity: computed.opacity };
  });
  expect(style).toEqual({ animationName: "none", opacity: "1" });
});
