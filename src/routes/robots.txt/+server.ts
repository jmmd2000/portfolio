import { siteURL } from "$lib/site";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
  const robots = `User-agent: *
Disallow: /admin

Sitemap: ${new URL("/sitemap.xml", siteURL).href}
`;

  return new Response(robots, { headers: { "Content-Type": "text/plain" } });
};
