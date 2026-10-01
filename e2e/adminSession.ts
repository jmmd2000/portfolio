import type { Page } from "@playwright/test";
import { createAdminUser } from "$lib/server/auth/adminUser";
import { e2eEnvironment } from "./environment";

export const adminEmail = "admin@example.com";
export const adminPassword = "correct-horse-battery-staple";

/** Adds the admin user. The database is wiped before every test, so each test that logs in calls this first */
export async function createAdmin(): Promise<void> {
  await createAdminUser(e2eEnvironment.DATABASE_URL_TEST_E2E, adminEmail, adminPassword);
}

/** Submits the login form. It doesn't check the result, so tests can log in with a wrong password too */
export async function logIn(page: Page, withPassword = adminPassword): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(withPassword);
  await page.getByRole("button", { name: "Log in" }).click();
}
