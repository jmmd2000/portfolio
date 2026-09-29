import { navigationLinks } from "$lib/components/navigation/navigation";
import { siteURL } from "$lib/site";
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

test("sitemap.xml lists every page in the nav", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const sitemap = await response.text();

  const listedURLs = [...sitemap.matchAll(/<loc>(.+?)<\/loc>/g)].map(match => match[1]);
  const pageURLs = navigationLinks.map(link => new URL(link.path, siteURL).href);
  expect(listedURLs).toEqual(pageURLs);
});
