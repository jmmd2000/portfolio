import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

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

  await expect(page.getByLabel("Live link text")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Shown on the CV")).toBeChecked();
  await expect(page.getByLabel("Live link", { exact: true })).toHaveValue("https://sandsim.jamesmddoyle.com/");
});
