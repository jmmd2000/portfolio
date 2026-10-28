import { openFold } from "./adminFold";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("a failed save shows its error on that job's form only", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/cv");

  await openFold(page, "Software Engineer at Ericsson");
  const ericsson = page.getByRole("group", { name: "Software Engineer at Ericsson" });
  await ericsson.getByLabel("Finished").fill("2020-01");
  await ericsson.getByRole("button", { name: "Save" }).click();

  await expect(ericsson.getByLabel("Finished")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(1);
  await expect(ericsson.getByLabel("Finished")).toHaveValue("2020-01");
});

test("a saved message only shows on its own list, when another list has an item with the same id", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/cv");

  // The seed gives the first job, skill category and qualification the same id
  await openFold(page, "Frontend");
  const frontend = page.getByRole("group", { name: "Frontend" });
  await frontend.getByRole("button", { name: "Save" }).click();

  await expect(frontend.getByRole("status")).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(1);
});

test("without JavaScript, a failed save opens its job again so the error shows", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // Block the app's JavaScript, so the form submits as plain HTML
  await page.route("**/_app/**/*.js", route => route.abort());
  await page.goto("/admin/cv");

  await openFold(page, "Software Engineer at Ericsson");
  const ericsson = page.getByRole("group", { name: "Software Engineer at Ericsson" });
  await ericsson.getByLabel("Finished").fill("2020-01");
  await ericsson.getByRole("button", { name: "Save" }).click();

  await expect(ericsson.getByLabel("Finished")).toHaveAttribute("aria-invalid", "true");
});
