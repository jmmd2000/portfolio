import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

test.use({ viewport: { width: 320, height: 640 } });

async function sidewaysOverflow(page: Page): Promise<number> {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

const paths = ["/", "/projects", "/articles", "/articles/a-long-article-address", "/cv", "/anaddresswithnoplacetobreakthatrunspasttheedgeofaphone", "/admin/login"];

for (const path of paths) {
  test(`${path} doesn't scroll sideways at 320px`, async ({ page }) => {
    await insertArticle({ slug: "a-long-article-address" });
    await page.goto(path);

    expect(await sidewaysOverflow(page)).toBe(0);
  });
}

const adminPaths = ["/admin/profile", "/admin/socials", "/admin/cv", "/admin/projects", "/admin/articles", "/admin/currently", "/admin/password"];

for (const path of adminPaths) {
  test(`${path} doesn't scroll sideways at 320px for the admin`, async ({ page }) => {
    await insertArticle({ slug: "a-long-article-address" });
    await createAdmin();
    await logIn(page);
    await page.goto(path);
    await expect(page).toHaveURL(path);

    expect(await sidewaysOverflow(page)).toBe(0);
  });
}

test("a project's edit page doesn't scroll sideways at 320px", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/projects");
  await page.getByRole("link", { name: "JamesReviewsMusic" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("JamesReviewsMusic");

  expect(await sidewaysOverflow(page)).toBe(0);
});
