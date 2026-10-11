import { shownNavigationLinks } from "$lib/components/navigation/navigation";
import { getPublishedArticleSlugs } from "$lib/server/content/articles";
import { siteURL } from "$lib/site";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const articleSlugs = await getPublishedArticleSlugs();
  const pageURLs = shownNavigationLinks(articleSlugs.length > 0).map(link => new URL(link.path, siteURL).href);
  const articleURLs = articleSlugs.map(slug => new URL(`/articles/${slug}`, siteURL).href);

  const entries = [...pageURLs, ...articleURLs].map(pageURL => `  <url><loc>${pageURL}</loc></url>`).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(sitemap, { headers: { "Content-Type": "application/xml" } });
};
