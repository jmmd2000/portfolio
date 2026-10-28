import type { Browser, Page } from "@playwright/test";
import postgres from "postgres";
import { e2eEnvironment } from "./environment";
import { expect, test } from "./fixtures";

const desktopChrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

/** A visitor with an ordinary browser's user agent, from their own address, kept off other sites */
async function visitor(browser: Browser, address: string, javaScriptEnabled: boolean) {
  const context = await browser.newContext({ baseURL: "http://localhost:4173", userAgent: desktopChrome, javaScriptEnabled, extraHTTPHeaders: { "x-forwarded-for": address } });
  const page = await context.newPage();
  await page.route(
    url => url.hostname !== "localhost",
    route => route.abort()
  );
  return page;
}

test("only a browser that runs the page counts, and only once a day", async ({ browser }) => {
  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  const visitorCount = async () => {
    const [row] = await client<{ count: number }[]>`select count from counters where name = 'visitors'`;
    return row?.count ?? 0;
  };

  const pages: Page[] = [];
  try {
    const withoutScripts = await visitor(browser, "203.0.113.20", false);
    pages.push(withoutScripts);
    await withoutScripts.goto("/cv", { waitUntil: "networkidle" });
    expect(await visitorCount()).toBe(0);

    const withScripts = await visitor(browser, "203.0.113.21", true);
    pages.push(withScripts);
    await withScripts.goto("/cv");
    await expect.poll(visitorCount).toBe(1);

    for (let attempt = 0; attempt < 10; attempt++) {
      expect((await withScripts.request.post("/api/visits")).status()).toBe(204);
    }
    expect(await visitorCount()).toBe(1);
  } finally {
    await Promise.all(pages.map(page => page.context().close()));
    await client.end();
  }
});

test("the footer leaves out the visitor count when it can't be read, and the page still loads", async ({ page }) => {
  await page.goto("/cv");
  await expect(page.locator("footer .visitors")).toBeVisible();

  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  try {
    await client`alter table counters rename to counters_unreachable`;
    const response = await page.reload();

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "GitHub" })).toBeVisible();
    await expect(page.locator("footer .visitors")).toHaveCount(0);
  } finally {
    await client`alter table counters_unreachable rename to counters`;
    await client.end();
  }
});
