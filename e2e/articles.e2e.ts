import { createAdmin, logIn } from "./adminSession";
import { findProjectID, insertArticle, insertSlugRedirect } from "./articles";
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

test("the signed-in admin sees a draft at its address, labelled and kept out of search engines", async ({ page }) => {
  await insertArticle({ slug: "draft", published: false, publishedAt: null });
  await createAdmin();
  await logIn(page);

  const response = await page.goto("/articles/draft");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("article").getByText("Draft", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
});

test("an unpublished article's old address only redirects for the signed-in admin", async ({ page, request }) => {
  await insertArticle({ slug: "falling-sand", published: false, publishedAt: new Date("2026-10-03T09:00:00Z") });
  await insertSlugRedirect("how-the-sand-falls", "falling-sand");

  expect((await request.get("/articles/how-the-sand-falls")).status()).toBe(404);

  await createAdmin();
  await logIn(page);
  const response = await page.request.get("/articles/how-the-sand-falls", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()["location"]).toBe("/articles/falling-sand");
  expect(response.headers()["cache-control"]).toBeUndefined();
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

test("a project links to its published write-up", async ({ page }) => {
  await insertArticle({ projectID: await findProjectID("SandSim") });

  await page.goto("/projects");
  await page.getByRole("link", { name: "Read the write-up for SandSim" }).click();

  await expect(page).toHaveURL(/\/articles\/how-the-sand-falls$/);
});
