import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("without JavaScript, a failed save keeps what was typed and says what's wrong", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // Block the app's JavaScript, so the form submits as plain HTML
  await page.route("**/_app/**/*.js", route => route.abort());
  await page.goto("/admin/profile");

  await page.getByLabel("Name").fill("   ");
  await page.getByLabel("Intro").fill("An intro that should still be here.");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Intro")).toHaveValue("An intro that should still be here.");
});
