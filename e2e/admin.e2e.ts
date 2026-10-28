import type { Page } from "@playwright/test";
import { adminEmail, adminPassword, createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test.beforeEach(async () => {
  await createAdmin();
});

test("a signed-out visitor can't reach the admin, or save anything in it", async ({ page, request, baseURL }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/login");

  const response = await request.get("/api/admin/anything");
  expect(response.status()).toBe(401);

  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  const save = await request.post("/admin/socials?/add", { headers: { origin: baseURL ?? "" }, form: { name: "Spam", url: "https://example.com" }, maxRedirects: 0 });
  expect(save.status()).toBe(303);
  expect(save.headers()["location"]).toBe("/admin/login");
});

test("the admin can log in and out", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/admin/profile");

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/admin/login");
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/login");
});

test("after 5 failed logins, even the right password is refused", async ({ page }) => {
  // Its own client IP, so this lockout can't affect the other tests
  await page.setExtraHTTPHeaders({ "x-forwarded-for": "203.0.113.7" });
  await page.goto("/admin/login");

  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByLabel("Email").fill(adminEmail);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  }

  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL("/admin/login");
});

async function changePassword(page: Page, currentPassword: string, newPassword: string): Promise<void> {
  await page.goto("/admin/password");
  await page.getByLabel("Current password").fill(currentPassword);
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("New password again").fill(newPassword);
  await page.getByRole("button", { name: "Change password" }).click();
}

test("the admin can change the password, but only with the current one", async ({ page }) => {
  await logIn(page);

  await changePassword(page, "not-the-password", "a-brand-new-password");
  await expect(page.getByRole("alert")).toBeVisible();

  await changePassword(page, adminPassword, "a-brand-new-password");
  await expect(page.getByRole("status")).toBeVisible();

  await page.goto("/admin");
  await page.getByRole("button", { name: "Log out" }).click();
  await logIn(page, "a-brand-new-password");
  await expect(page).toHaveURL("/admin/profile");
});

test("changing the password signs out every other session", async ({ page, browser }) => {
  const otherDevice = await browser.newPage();
  await logIn(page);
  await logIn(otherDevice);

  await changePassword(page, adminPassword, "a-brand-new-password");
  await expect(page.getByRole("status")).toBeVisible();

  await otherDevice.goto("/admin");
  await expect(otherDevice).toHaveURL("/admin/login");
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/profile");

  await otherDevice.close();
});
