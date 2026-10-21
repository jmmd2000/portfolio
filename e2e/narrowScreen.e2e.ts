import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

test.use({ viewport: { width: 320, height: 640 } });

const paths = ["/", "/projects", "/articles", "/articles/a-long-article-address", "/cv", "/anaddresswithnoplacetobreakthatrunspasttheedgeofaphone"];

for (const path of paths) {
  test(`${path} doesn't scroll sideways at 320px`, async ({ page }) => {
    await insertArticle({ slug: "a-long-article-address" });
    // Images from other sites can hang, and the layout doesn't wait for them
    await page.route(
      url => url.hostname !== "localhost",
      route => route.abort()
    );
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}
