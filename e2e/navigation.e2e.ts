import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

test("the server marks the current page, before any JavaScript runs", async ({ page }) => {
  // Block the app's JavaScript, so only the server's HTML is tested
  await page.route("**/_app/**/*.js", route => route.abort());

  await page.goto("/projects");

  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
});

test("the Articles link only shows once an article is published", async ({ page }) => {
  const articlesLink = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Articles" });
  await insertArticle({ slug: "draft", published: false, publishedAt: null });

  await page.goto("/");
  await expect(articlesLink).toHaveCount(0);

  await insertArticle({ slug: "published" });
  await page.reload();
  await expect(articlesLink).toBeVisible();
});
