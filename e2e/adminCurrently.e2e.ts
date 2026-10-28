import { openFold } from "./adminFold";
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

test("a failed cover search says so, and Enter in the search box doesn't save the row", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // The search fails in the browser, so the server never asks a real source
  await page.route(
    url => url.pathname === "/api/admin/covers",
    route => route.fulfill({ status: 502 })
  );
  await page.goto("/admin/currently");
  await openFold(page, "Reading: To Kill a Mockingbird");
  const row = page.getByRole("group", { name: "Reading: To Kill a Mockingbird" });
  const coverBefore = await row.getByLabel("Cover URL").inputValue();

  await row.getByRole("button", { name: "Find cover" }).click();
  const search = page.getByRole("dialog");
  await expect(search.getByRole("alert")).toBeVisible();
  await search.getByLabel("Search words").press("Enter");
  await search.getByRole("button", { name: "Close" }).click();

  await expect(row.getByLabel("Cover URL")).toHaveValue(coverBefore);
  await expect(row.getByRole("status")).toHaveCount(0);
});
