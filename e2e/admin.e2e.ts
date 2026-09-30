import { createAdminUser } from "$lib/server/auth/adminUser";
import { e2eEnvironment } from "./environment";
import { expect, test } from "./fixtures";

const email = "admin@example.com";
const password = "correct-horse-battery-staple";

test.beforeEach(async () => {
  await createAdminUser(e2eEnvironment.DATABASE_URL_TEST_E2E, email, password);
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
