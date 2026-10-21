import type { Page } from "@playwright/test";
import { openFold } from "./adminFold";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

async function cvJobTitles(page: Page): Promise<string[]> {
  await page.goto("/cv");
  return page.getByRole("region", { name: "Experience" }).getByRole("heading", { level: 3 }).allTextContents();
}

test("a signed-out visitor can't add a job", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/cv?/addJob", {
    headers: { origin: baseURL ?? "" },
    form: { title: "Spam", company: "Spam", companyURL: "", location: "", logoURL: "https://example.com/logo.png", startDate: "2025-01", endDate: "", bullets: "", tags: "" },
  });

  expect(await cvJobTitles(page)).toEqual(["Software Engineer", "Front-End Developer Intern"]);
});

test("a failed save shows its error on that job's form only", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/cv");

  await openFold(page, "Software Engineer at Ericsson");
  const ericsson = page.getByRole("group", { name: "Software Engineer at Ericsson" });
  await ericsson.getByLabel("Finished").fill("2020-01");
  await ericsson.getByRole("button", { name: "Save" }).click();

  await expect(ericsson.getByText("End date can't be before start date")).toBeVisible();
  await expect(page.getByText("End date can't be before start date")).toHaveCount(1);
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

  await expect(frontend.getByText("Frontend saved.")).toBeVisible();
  await expect(page.getByText("Frontend saved.")).toHaveCount(1);
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

  await expect(ericsson.getByText("End date can't be before start date")).toBeVisible();
});
