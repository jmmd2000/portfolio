import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

const previewURL = "**/api/admin/markdown-preview";

async function openArticleEditor(page: Page): Promise<void> {
  await insertArticle({ published: false, publishedAt: null });
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  await page.getByRole("link", { name: "How the sand falls" }).click();
}

test("the preview endpoint refuses a signed-out visitor", async ({ request }) => {
  const response = await request.post("/api/admin/markdown-preview", { data: { markdown: "## Hello" } });

  expect(response.status()).toBe(401);
});

test("the preview endpoint refuses a request without markdown", async ({ page }) => {
  await createAdmin();
  await logIn(page);

  const response = await page.request.post("/api/admin/markdown-preview", { data: { text: "## Hello" } });

  expect(response.status()).toBe(400);
});

test("a slow preview can't replace a newer one", async ({ page }) => {
  await openArticleEditor(page);

  let releaseFirst = (): void => {};
  const firstHeld = new Promise<void>(resolve => (releaseFirst = resolve));
  let requestCount = 0;
  await page.route(previewURL, async route => {
    requestCount += 1;
    if (requestCount === 1) await firstHeld;
    // The page cancels a held request, and a cancelled request can't be continued
    await route.continue().catch(() => {});
  });

  const firstCancelled = page.waitForEvent("requestfailed", request => request.url().endsWith("/api/admin/markdown-preview"));
  const firstSent = page.waitForRequest(previewURL);
  await page.getByLabel("Body").fill("## First");
  await firstSent;
  await page.getByLabel("Body").fill("## Second");

  const preview = page.getByRole("region", { name: "Preview" });
  await expect(preview.getByRole("heading", { level: 2 })).toHaveText("Second");
  releaseFirst();
  await firstCancelled;
  await expect(preview.getByRole("heading", { level: 2 })).toHaveText("Second");
});

test("a failed preview says so, and the next keystroke tries again", async ({ page }) => {
  await openArticleEditor(page);
  await page.route(previewURL, route => route.fulfill({ status: 500 }));

  const preview = page.getByRole("region", { name: "Preview" });
  await page.getByLabel("Body").fill("## Broken");
  await expect(preview.getByRole("status")).toBeVisible();

  await page.unroute(previewURL);
  await page.getByLabel("Body").fill("## Working");
  await expect(preview.getByRole("heading", { level: 2 })).toHaveText("Working");
  await expect(preview.getByRole("status")).toBeHidden();
});
