import type { Page } from "@playwright/test";
import { adminEmail as email, adminPassword as password, createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test.beforeEach(async () => {
  await createAdmin();
});

test("a signed-out visitor can't reach the admin", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/login");

  const response = await request.get("/api/admin/anything");
  expect(response.status()).toBe(401);
});

test("the admin can log in and out", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByText(`Signed in as ${email}.`)).toBeVisible();

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
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert")).toHaveText("Wrong email or password.");
  }

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("alert")).toHaveText("Too many attempts. Try again in 15 minutes.");
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
  await logIn(page, password);

  await changePassword(page, "not-the-password", "a-brand-new-password");
  await expect(page.getByRole("alert")).toHaveText("Your current password is wrong.");

  await changePassword(page, password, "a-brand-new-password");
  await expect(page.getByRole("status")).toHaveText("Password changed. Every other session has been signed out.");

  await page.goto("/admin");
  await page.getByRole("button", { name: "Log out" }).click();
  await logIn(page, "a-brand-new-password");
  await expect(page.getByText(`Signed in as ${email}.`)).toBeVisible();
});

test("changing the password signs out every other session", async ({ page, browser }) => {
  const otherDevice = await browser.newPage();
  await logIn(page, password);
  await logIn(otherDevice, password);

  await changePassword(page, password, "a-brand-new-password");
  await expect(page.getByRole("status")).toBeVisible();

  await otherDevice.goto("/admin");
  await expect(otherDevice).toHaveURL("/admin/login");
  await page.goto("/admin");
  await expect(page.getByText(`Signed in as ${email}.`)).toBeVisible();

  await otherDevice.close();
});
