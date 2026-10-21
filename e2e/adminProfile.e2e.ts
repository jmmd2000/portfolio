import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("a signed-out visitor can't save the profile", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/profile", { headers: { origin: baseURL ?? "" }, form: { name: "Someone else", role: "Role", intro: "Intro", location: "Here" } });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("James Doyle");
});

test("the admin edits the profile, and the home page shows it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("link", { name: "Profile" }).click();

  await page.getByLabel("Intro").fill("Test lead in Dublin.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("James Doyle");

  await page.goto("/");
  await expect(page.getByRole("banner").getByText("Test lead in Dublin.")).toBeVisible();
});

test("without JavaScript, a failed save keeps what was typed and says what's wrong", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // Block the app's JavaScript, so the form submits as plain HTML
  await page.route("**/_app/**/*.js", route => route.abort());
  await page.goto("/admin/profile");

  await page.getByLabel("Name").fill("   ");
  await page.getByLabel("Intro").fill("An intro that should still be here.");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Add a name.")).toBeVisible();
  await expect(page.getByLabel("Intro")).toHaveValue("An intro that should still be here.");
});
