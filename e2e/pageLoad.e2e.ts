import { expect, test } from "./fixtures";

// A stylesheet over the inline limit would be linked again, and block the first paint without anyone seeing it
test("no stylesheet holds up the first paint, since the page's CSS is in the HTML", async ({ request }) => {
  const html = await (await request.get("/")).text();
  const stylesheetLinks = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g) ?? [];

  expect(html).toContain("<style");
  // SvelteKit keeps disabled links for client-side navigation. They don't block rendering
  expect(stylesheetLinks.filter(link => !link.includes("disabled"))).toEqual([]);
});

for (const path of ["/", "/cv"]) {
  test(`the name on ${path} barely moves when fitText sizes it on a phone`, async ({ browser }) => {
    const heights: number[] = [];
    for (const javaScriptEnabled of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 412, height: 800 }, javaScriptEnabled });
      const page = await context.newPage();
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const name = page.getByRole("heading", { level: 1 });
      if (javaScriptEnabled) await expect(name.locator(".part").first()).toHaveAttribute("style", /font-size/);
      heights.push(await name.evaluate(element => element.getBoundingClientRect().height));
      await context.close();
    }

    expect(Math.abs(heights[1] - heights[0])).toBeLessThanOrEqual(6);
  });
}

test("the home page's first screen stays put when the fonts arrive on a phone", async ({ browser }) => {
  const viewportHeight = 800;
  // Without JavaScript, so only the font swap can move anything
  const context = await browser.newContext({ viewport: { width: 412, height: viewportHeight }, javaScriptEnabled: false });
  const page = await context.newPage();
  let releaseFonts = () => {};
  const fontsHeld = new Promise<void>(resolve => (releaseFonts = resolve));
  await page.route("**/*.woff2", async route => {
    await fontsHeld;
    await route.continue();
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const leafTops = () => page.evaluate(() => [...document.querySelectorAll("body *")].filter(element => element.children.length === 0).map(element => element.getBoundingClientRect().top));
  const topsInFallback = await leafTops();
  releaseFonts();
  await page.evaluate(() => document.fonts.ready);
  const topsInWebFonts = await leafTops();
  await context.close();

  const moves = topsInFallback.flatMap((top, index) => (top < viewportHeight ? [Math.abs(top - topsInWebFonts[index])] : []));
  expect(moves.length).toBeGreaterThan(0);
  expect(Math.max(...moves)).toBeLessThanOrEqual(4);
});
