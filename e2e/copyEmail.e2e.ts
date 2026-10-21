import { expect, test } from "./fixtures";

test("Copy email selects the address when the clipboard is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("Blocked")) } });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Copy email" }).click();

  await expect(page.getByRole("button", { name: "Selected" })).toBeVisible();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toMatch(/^hi@jamesmddoyle\.com$/i);
});
