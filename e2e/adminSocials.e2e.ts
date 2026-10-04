import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

async function footerLinkNames(page: Page): Promise<string[]> {
  return page.locator("footer .socials a").allTextContents();
}

test("a signed-out visitor can't add a link", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/socials?/add", { headers: { origin: baseURL ?? "" }, form: { name: "Spam", url: "https://example.com" } });

  await page.goto("/");
  expect(await footerLinkNames(page)).toEqual(["GitHub", "LinkedIn", "Email"]);
});

test("the admin adds, renames and moves a link, and the footer follows", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("link", { name: "Socials" }).click();

  const add = page.getByRole("group", { name: "Add a link" });
  await add.getByLabel("Name").fill("Bluesky");
  await add.getByLabel("Address").fill("https://bsky.app/profile/jamesmddoyle");
  await add.getByRole("button", { name: "Add" }).click();
  await expect(add.getByText("Bluesky added.")).toBeVisible();

  const bluesky = page.getByRole("group", { name: "Bluesky" });
  await bluesky.getByLabel("Name").fill("Bsky");
  await bluesky.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("group", { name: "Bsky" }).getByText("Bsky saved.")).toBeVisible();

  await page.getByRole("group", { name: "Bsky" }).getByRole("button", { name: "Move up" }).click();
  await expect(page.locator("legend")).toHaveText(["GitHub", "LinkedIn", "Bsky", "Email", "Add a link"]);

  await page.goto("/");
  expect(await footerLinkNames(page)).toEqual(["GitHub", "LinkedIn", "Bsky", "Email"]);
});

test("deleting a link takes a second click", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/socials");

  const email = page.getByRole("group", { name: "Email" });
  await expect(email.getByRole("button", { name: "Delete Email" })).toBeHidden();
  await email.getByRole("button", { name: "Delete", exact: true }).click();
  await email.getByRole("button", { name: "Delete Email" }).click();
  await expect(email).toBeHidden();

  await page.goto("/");
  expect(await footerLinkNames(page)).toEqual(["GitHub", "LinkedIn"]);
});
