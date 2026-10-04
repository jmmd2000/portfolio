import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

async function hideRow(page: Page, legend: string): Promise<void> {
  const row = page.getByRole("group", { name: legend });
  await row.getByLabel("Shown on the home page").uncheck();
  await row.getByRole("button", { name: "Save" }).click();
  await expect(row.getByText("saved.")).toBeVisible();
}

test("a row hidden in the admin leaves the home page", async ({ page }) => {
  const currently = page.getByRole("region", { name: "Currently" });
  await page.goto("/");
  await expect(currently.getByRole("listitem")).toHaveCount(4);

  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");
  await hideRow(page, "Playing: Fallout 4");

  await page.goto("/");
  await expect(currently.getByRole("listitem")).toHaveText([/Bon Iver, Bon Iver/, /Breaking Bad/, /To Kill a Mockingbird/]);
  await expect(currently.getByRole("img", { name: "Cover of Bon Iver, Bon Iver" })).toBeVisible();
});

test("the Currently section is hidden when no rows are shown", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");
  for (const legend of ["Listening: Bon Iver, Bon Iver", "Playing: Fallout 4", "Watching: Breaking Bad", "Reading: To Kill a Mockingbird"]) {
    await hideRow(page, legend);
  }

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Projects", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Currently" })).toHaveCount(0);
});
