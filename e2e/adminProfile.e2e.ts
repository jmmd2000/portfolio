import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("a signed-out visitor can't save the profile", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/profile", { headers: { origin: baseURL ?? "" }, form: { name: "Someone else", role: "Role", location: "Here", bio: "Bio" } });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("James Doyle");
});

test("the admin edits the profile, and the home page shows it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("link", { name: "Profile" }).click();

  await page.getByLabel("Role").fill("Test Lead");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("James Doyle");

  await page.goto("/");
  await expect(page.locator("header .role")).toHaveText("Test Lead");
});

test("without JavaScript, a failed save keeps what was typed and says what's wrong", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // Block the app's JavaScript, so the form submits as plain HTML
  await page.route("**/_app/**/*.js", route => route.abort());
  await page.goto("/admin/profile");

  await page.getByLabel("Name").fill("   ");
  await page.getByLabel("Bio").fill("A bio that should still be here.");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Add a name.")).toBeVisible();
  await expect(page.getByLabel("Bio")).toHaveValue("A bio that should still be here.");
});
