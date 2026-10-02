import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

async function footerLinkNames(page: Page): Promise<string[]> {
  return page.locator("footer li a").allTextContents();
}

test("a signed-out visitor can't change the links, and the server refuses them", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator("footer").getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit links" })).toHaveCount(0);

  const response = await request.post("/api/admin/socials", { data: { name: "Bluesky", url: "https://bsky.app/profile/jamesmddoyle" } });
  expect(response.status()).toBe(401);
});

test("the admin adds, renames and moves a link, and it all survives a reload", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.getByRole("button", { name: "Edit links" }).click();

  await footer.getByRole("button", { name: "+ Add link" }).click();
  await footer.getByLabel("New link name").fill("Bluesky");
  await footer.getByLabel("New link address").fill("https://bsky.app/profile/jamesmddoyle");
  await footer.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("Bluesky added.")).toBeVisible();

  await footer.locator("li").filter({ hasText: "Bluesky" }).getByRole("textbox", { name: "Link name" }).fill("Bsky");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Link name saved.")).toBeVisible();

  await footer.getByRole("button", { name: "Move Bsky left" }).click();
  await expect(page.getByText("Bsky moved.")).toBeVisible();

  await page.reload();
  expect(await footerLinkNames(page)).toEqual(["GitHub", "LinkedIn", "Bsky", "Email"]);
});

test("deleting a link asks first", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.getByRole("button", { name: "Edit links" }).click();

  await footer.getByRole("button", { name: "Delete Email" }).click();
  await footer.getByRole("button", { name: "Keep" }).click();
  expect(await footerLinkNames(page)).toContain("Email");

  await footer.getByRole("button", { name: "Delete Email" }).click();
  await footer.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Email deleted.")).toBeVisible();

  await page.reload();
  expect(await footerLinkNames(page)).toEqual(["GitHub", "LinkedIn"]);
});
