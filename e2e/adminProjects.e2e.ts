import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

const seededNames = ["JamesReviewsMusic", "Phantom", "SandSim", "Issues", "Vintage Recreations"];

test("a signed-out visitor can't add a project", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/projects?/add", { headers: { origin: baseURL ?? "" }, form: { title: "Spam", description: "Spam", imageURL: "https://example.com/spam.png" } });

  await createAdmin();
  await logIn(page);
  await page.goto("/admin/projects");
  await expect(page.locator(".projects .name")).toHaveText(seededNames);
});

test("without JavaScript, a failed save keeps what was typed, including the checkboxes", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // Block the app's JavaScript, so the page comes back from the server and has to fill the form itself
  await page.route("**/_app/**/*.js", route => route.abort());
  await page.goto("/admin/projects");
  await page.getByRole("link", { name: "SandSim" }).click();

  await page.getByLabel("Live link text").fill("");
  await page.getByLabel("Shown on the CV").check();
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Add the text for the live link")).toBeVisible();
  await expect(page.getByLabel("Shown on the CV")).toBeChecked();
  await expect(page.getByLabel("Live link", { exact: true })).toHaveValue("https://jamesmddoyle.com/sand-sim/");
});
