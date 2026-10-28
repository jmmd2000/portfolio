import type { Page } from "@playwright/test";
import { openFold } from "./adminFold";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

async function hideRow(page: Page, legend: string): Promise<void> {
  await openFold(page, legend);
  const row = page.getByRole("group", { name: legend });
  await row.getByLabel("Shown on the home page").uncheck();
  await row.getByRole("button", { name: "Save" }).click();
  await expect(row.getByRole("status")).toBeVisible();
}

test("the Currently section is hidden when no rows are shown", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");
  for (const legend of ["Listening: Bon Iver, Bon Iver", "Playing: Fallout 4", "Watching: Breaking Bad", "Reading: To Kill a Mockingbird"]) {
    await hideRow(page, legend);
  }

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Currently" })).toHaveCount(0);
});
