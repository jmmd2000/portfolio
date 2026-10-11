import type { APIRequestContext } from "@playwright/test";
import { navigationLinks } from "$lib/components/navigation/navigation";
import { siteURL } from "$lib/site";
import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

test("every page in the nav has its own title, a description and a canonical URL", async ({ page }) => {
  const titles: string[] = [];

  for (const link of navigationLinks) {
    await page.goto(link.path);

    titles.push(await page.title());
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new URL(link.path, siteURL).href);
  }

  expect(new Set(titles).size).toBe(navigationLinks.length);
});

test("a missing page is noindex and has no canonical URL", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

async function sitemapURLs(request: APIRequestContext): Promise<string[]> {
  const response = await request.get("/sitemap.xml");
  const sitemap = await response.text();
  return [...sitemap.matchAll(/<loc>(.+?)<\/loc>/g)].map(match => match[1]);
}

test("sitemap.xml lists the pages in the nav, without Articles while none are published", async ({ request }) => {
  const pageURLs = ["/", "/projects", "/cv"].map(path => new URL(path, siteURL).href);

  expect(await sitemapURLs(request)).toEqual(pageURLs);
});

test("sitemap.xml lists Articles and each published article, but never a draft", async ({ request }) => {
  await insertArticle({ slug: "published" });
  await insertArticle({ slug: "draft", published: false, publishedAt: null });

  const listedURLs = await sitemapURLs(request);

  expect(listedURLs).toContain(new URL("/articles", siteURL).href);
  expect(listedURLs).toContain(new URL("/articles/published", siteURL).href);
  expect(listedURLs).not.toContain(new URL("/articles/draft", siteURL).href);
});
