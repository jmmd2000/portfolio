import type { Page } from "@playwright/test";

/** Opens a folded item on an admin list page by clicking its name. Does nothing if it's already open */
export async function openFold(page: Page, name: string): Promise<void> {
  const summary = page.locator("summary").getByText(name, { exact: true });
  const isOpen = await page
    .locator("details")
    .filter({ has: summary })
    .evaluate(details => (details as HTMLDetailsElement).open);
  if (isOpen) return;

  await summary.click();
}
