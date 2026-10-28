import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

async function openArticleEditor(page: Page): Promise<void> {
  await insertArticle({ published: false, publishedAt: null });
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  await page.getByRole("link", { name: "How the sand falls" }).click();
  await page.getByLabel("Body").waitFor();
}

/** The draft the editor keeps in the browser, or null */
function keptDraft(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(storedKey => storedKey.startsWith("article-draft-"));
    return key ? localStorage.getItem(key) : null;
  });
}

test("unsaved writing survives a reload and can be restored", async ({ page }) => {
  await openArticleEditor(page);

  await page.getByLabel("Title").fill("How sand really falls");
  await page.getByLabel("Body").fill("## Kept safe");
  await expect.poll(() => keptDraft(page)).toContain("Kept safe");
  await page.reload();
  await page.getByRole("button", { name: "Restore" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("How sand really falls");
  await expect(page.getByLabel("Body")).toHaveValue("## Kept safe");
  await expect(page.getByRole("region", { name: "Preview" }).getByRole("heading", { level: 2 })).toHaveText("Kept safe");
});

test("saving clears the kept draft", async ({ page }) => {
  await openArticleEditor(page);

  await page.getByLabel("Body").fill("## Saved now");
  await expect.poll(() => keptDraft(page)).toContain("Saved now");
  await page.getByRole("button", { name: "Save" }).click();

  await expect.poll(() => keptDraft(page)).toBeNull();
});

test("discarding a kept draft removes it", async ({ page }) => {
  await openArticleEditor(page);

  await page.getByLabel("Body").fill("## Thrown away");
  await expect.poll(() => keptDraft(page)).toContain("Thrown away");
  await page.reload();
  await page.getByRole("button", { name: "Discard" }).click();

  await expect(page.getByLabel("Body")).toHaveValue("## The grid\n\nEach cell holds one material.");
  await expect.poll(() => keptDraft(page)).toBeNull();
});

test("writing while the restore offer shows is kept too", async ({ page }) => {
  await openArticleEditor(page);

  await page.getByLabel("Body").fill("## First try");
  await expect.poll(() => keptDraft(page)).toContain("First try");
  await page.reload();
  await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
  await page.getByLabel("Body").fill("## Second try");

  await expect.poll(() => keptDraft(page)).toContain("Second try");
});
