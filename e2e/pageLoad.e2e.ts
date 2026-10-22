import { expect, test } from "./fixtures";

// A stylesheet over the inline limit would be linked again, and block the first paint without anyone seeing it
test("no stylesheet holds up the first paint, since the page's CSS is in the HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const stylesheetLinks = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g) ?? [];

  expect(html).toContain("<style");
  // SvelteKit keeps disabled links for client-side navigation. They don't block rendering
  expect(stylesheetLinks.filter(link => !link.includes("disabled"))).toEqual([]);
});
