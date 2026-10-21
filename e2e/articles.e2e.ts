import { createAdmin, logIn } from "./adminSession";
import { insertArticle, insertSlugRedirect } from "./articles";
import { expect, test } from "./fixtures";

test("a draft's address returns a 404", async ({ page }) => {
  await insertArticle({ slug: "draft", published: false, publishedAt: null });

  const response = await page.goto("/articles/draft");

  expect(response?.status()).toBe(404);
});

test("only the signed-in admin gets an Edit link on an article, and it opens the editor", async ({ page }) => {
  await insertArticle();
  await page.goto("/articles/how-the-sand-falls");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How the sand falls");
  await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);

  await createAdmin();
  await logIn(page);
  await page.goto("/articles/how-the-sand-falls");
  await page.getByRole("link", { name: "Edit" }).click();

  await expect(page.getByLabel("Body")).toHaveValue("## The grid\n\nEach cell holds one material.");
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

test("the home page lists the five newest published articles and links to all of them", async ({ page }) => {
  const writing = page.getByRole("region", { name: "Writing" });
  await page.goto("/");
  await expect(writing).toHaveCount(0);

  const months = ["01", "02", "03", "04", "05", "06"];
  for (const month of months) {
    await insertArticle({ slug: `article-${month}`, title: `Article ${month}`, publishedAt: new Date(`2026-${month}-01T09:00:00Z`) });
  }
  await insertArticle({ slug: "draft", title: "Draft", published: false, publishedAt: null });
  await page.reload();

  await expect(writing.getByRole("listitem")).toHaveText([/Article 06/, /Article 05/, /Article 04/, /Article 03/, /Article 02/]);
  await expect(writing.getByRole("link", { name: "All 6 articles" })).toBeVisible();
});
