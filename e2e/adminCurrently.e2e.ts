import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("the admin moves a row without opening it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");

  const fallout = page.getByRole("listitem").filter({ hasText: "Playing: Fallout 4" });
  await fallout.getByRole("button", { name: "Move down" }).click();

  await expect(page.locator(".rows legend")).toHaveText(["Listening: Bon Iver, Bon Iver", "Watching: Breaking Bad", "Playing: Fallout 4", "Reading: To Kill a Mockingbird"]);
});
