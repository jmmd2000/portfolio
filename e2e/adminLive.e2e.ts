import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

const browserUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

test("visitors are still counted while the count is hidden", async ({ page, browser }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/live");
  const showCount = page.getByLabel("Show the visitor count in the footer");
  await showCount.uncheck();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Live parts saved.")).toBeVisible();

  // Headless Chrome counts as a crawler, so the visitor gets an ordinary browser's user agent
  const visitorContext = await browser.newContext({ userAgent: browserUserAgent, extraHTTPHeaders: { "x-forwarded-for": "203.0.113.7" } });
  const visitor = await visitorContext.newPage();
  await visitor.goto("/cv");
  await expect(visitor.getByRole("contentinfo").getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(visitor.getByText(/^You are visitor/)).toHaveCount(0);
  await visitorContext.close();

  await showCount.check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Live parts saved.")).toBeVisible();

  // The signed-in admin isn't counted, so this shows only the visit made while the count was hidden
  await page.goto("/cv");
  await expect(page.getByText("You are visitor 1", { exact: true })).toBeVisible();
});
