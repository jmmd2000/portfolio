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

test("the home page lists the three newest published articles", async ({ page }) => {
  const articlesSection = page.getByRole("region", { name: "Articles" });
  await page.goto("/");
  await expect(articlesSection).toHaveCount(0);

  await insertArticle({ slug: "oldest", title: "Oldest", publishedAt: new Date("2026-01-01T09:00:00Z") });
  await insertArticle({ slug: "older", title: "Older", publishedAt: new Date("2026-02-01T09:00:00Z") });
  await insertArticle({ slug: "newer", title: "Newer", publishedAt: new Date("2026-03-01T09:00:00Z") });
  await insertArticle({ slug: "newest", title: "Newest", publishedAt: new Date("2026-04-01T09:00:00Z") });
  await insertArticle({ slug: "draft", title: "Draft", published: false, publishedAt: null });
  await page.reload();

  await expect(articlesSection.getByRole("listitem")).toHaveText([/Newest/, /Newer/, /Older/]);
});
