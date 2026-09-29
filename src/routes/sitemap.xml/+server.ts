import { navigationLinks } from "$lib/components/navigation/navigation";
import { siteURL } from "$lib/site";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
  const pageURLs = navigationLinks.map(link => new URL(link.path, siteURL).href);
  const entries = pageURLs.map(pageURL => `  <url><loc>${pageURL}</loc></url>`).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(sitemap, { headers: { "Content-Type": "application/xml" } });
};
