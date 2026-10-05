import type { Page } from "@playwright/test";
import { openFold } from "./adminFold";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

const seededLegends = ["Listening: Bon Iver, Bon Iver", "Playing: Fallout 4", "Watching: Breaking Bad", "Reading: To Kill a Mockingbird"];

async function addRow(page: Page, label: string, title: string): Promise<void> {
  await openFold(page, "Add a row");
  const add = page.getByRole("group", { name: "Add a row" });
  await add.getByLabel("Label").fill(label);
  await add.getByLabel("Title", { exact: true }).fill(title);
  await add.getByRole("button", { name: "Add" }).click();
  await expect(add.getByText(`${title} added.`)).toBeVisible();
}

test("a signed-out visitor can't add a row", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/currently?/add", { headers: { origin: baseURL ?? "" }, form: { label: "Spam", title: "Spam", subtitle: "", url: "", imageURL: "", shown: "on" } });

  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");
  await expect(page.locator(".rows legend")).toHaveText(seededLegends);
});

test("the admin adds, hides and moves rows, and they stay that way after a reload", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("main").getByRole("link", { name: "Currently" }).click();

  await addRow(page, "Listening", "Blue Rev");
  await addRow(page, "Reading", "Piranesi");

  await openFold(page, "Reading: Piranesi");
  const piranesi = page.getByRole("group", { name: "Reading: Piranesi" });
  await expect(piranesi.getByLabel("Shown on the home page")).toBeChecked();
  await piranesi.getByLabel("Shown on the home page").uncheck();
  await piranesi.getByRole("button", { name: "Save" }).click();
  await expect(piranesi.getByText("Piranesi saved.")).toBeVisible();

  await page.getByRole("listitem").filter({ has: piranesi }).getByRole("button", { name: "Move up" }).click();
  await expect(page.locator(".rows legend")).toHaveText([...seededLegends, "Reading: Piranesi", "Listening: Blue Rev"]);

  await page.reload();
  await expect(page.locator(".rows legend")).toHaveText([...seededLegends, "Reading: Piranesi", "Listening: Blue Rev"]);
  await openFold(page, "Reading: Piranesi");
  await openFold(page, "Listening: Blue Rev");
  await expect(page.getByRole("group", { name: "Reading: Piranesi" }).getByLabel("Shown on the home page")).not.toBeChecked();
  await expect(page.getByRole("group", { name: "Listening: Blue Rev" }).getByLabel("Shown on the home page")).toBeChecked();
});

test("the admin moves a row without opening it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");

  const fallout = page.getByRole("listitem").filter({ hasText: "Playing: Fallout 4" });
  await fallout.getByRole("button", { name: "Move down" }).click();

  await expect(page.locator(".rows legend")).toHaveText(["Listening: Bon Iver, Bon Iver", "Watching: Breaking Bad", "Playing: Fallout 4", "Reading: To Kill a Mockingbird"]);
});
