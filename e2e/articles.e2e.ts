import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

test("a published article shows its rendered markdown", async ({ page }) => {
  await insertArticle();

  await page.goto("/articles/how-the-sand-falls");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How the sand falls");
  await expect(page.getByRole("heading", { level: 2, name: "The grid" })).toHaveAttribute("id", "the-grid");
});

test("a draft's address returns a 404", async ({ page }) => {
  await insertArticle({ slug: "draft", published: false, publishedAt: null });

  const response = await page.goto("/articles/draft");

  expect(response?.status()).toBe(404);
});
