import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

async function footerLinkNames(page: Page): Promise<string[]> {
  return page.locator("footer .socials a").allTextContents();
}

test("a signed-out visitor can't add a link", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/socials?/add", { headers: { origin: baseURL ?? "" }, form: { name: "Spam", url: "https://example.com" } });

  await page.goto("/");
  expect(await footerLinkNames(page)).toEqual(["GitHub", "LinkedIn"]);
});
