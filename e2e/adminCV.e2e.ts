import type { Page } from "@playwright/test";
import { openFold } from "./adminFold";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

async function cvJobTitles(page: Page): Promise<string[]> {
  await page.goto("/cv");
  return page.locator(".job .title").allTextContents();
}

test("a signed-out visitor can't add a job", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/cv?/addJob", {
    headers: { origin: baseURL ?? "" },
    form: { title: "Spam", company: "Spam", companyURL: "", location: "", logoURL: "https://example.com/logo.png", startDate: "2025-01", endDate: "", bullets: "", tags: "" },
  });

  expect(await cvJobTitles(page)).toEqual(["Software Engineer", "Front-End Developer Intern"]);
});

test("the admin edits a job's bullets, and the CV shows one per line", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("main").getByRole("link", { name: "CV" }).click();

  await openFold(page, "Front-End Developer Intern at Fusio");
  const fusio = page.getByRole("group", { name: "Front-End Developer Intern at Fusio" });
  await fusio.getByLabel("Bullets").fill("Kept the client sites up to date\n\n  Built responsive layouts  ");
  await fusio.getByRole("button", { name: "Save" }).click();
  await expect(fusio.getByText("Fusio saved.")).toBeVisible();

  await page.goto("/cv");
  const job = page.locator(".job").filter({ hasText: "Fusio" });
  await expect(job.getByRole("listitem")).toHaveText(["Kept the client sites up to date", "Built responsive layouts"]);
});

test("the admin adds a current job, and the CV lists it first", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/cv");

  await openFold(page, "Add a job");
  const add = page.getByRole("group", { name: "Add a job" });
  await add.getByLabel("Title").fill("Test Lead");
  await add.getByLabel("Company", { exact: true }).fill("Acme");
  await add.getByLabel("Logo URL").fill("https://assets.jamesmddoyle.com/acme.png");
  await add.getByLabel("Started").fill("2025-01");
  await add.getByRole("button", { name: "Add" }).click();
  await expect(add.getByText("Test Lead at Acme added.")).toBeVisible();

  expect(await cvJobTitles(page)).toEqual(["Test Lead", "Software Engineer", "Front-End Developer Intern"]);
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

test("the admin renames and moves a skill category, and the CV follows", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/cv");

  await openFold(page, "Languages");
  const languages = page.getByRole("group", { name: "Languages" });
  await languages.getByLabel("Category").fill("Programming languages");
  await languages.getByRole("button", { name: "Save" }).click();
  const renamed = page.getByRole("group", { name: "Programming languages" });
  await expect(renamed.getByText("Programming languages saved.")).toBeVisible();

  await page.getByRole("listitem").filter({ has: renamed }).getByRole("button", { name: "Move up" }).click();
  await expect(page.locator("#skills legend")).toHaveText(["Frontend", "Backend & Data", "Programming languages", "DevOps & CI/CD", "Add a skill category"]);

  await page.goto("/cv");
  await expect(page.locator(".skills dt")).toHaveText(["Frontend", "Backend & Data", "Programming languages", "DevOps & CI/CD"]);
});

test("the admin adds a qualification, and the CV shows it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/cv");

  await openFold(page, "Add a qualification");
  const add = page.getByRole("group", { name: "Add a qualification" });
  await add.getByLabel("Qualification").fill("AWS Cloud Practitioner");
  await add.getByLabel("Institution").fill("Amazon Web Services");
  await add.getByLabel("Grade").fill("Pass");
  await add.getByLabel("Started").fill("2024");
  await add.getByLabel("Finished").fill("2024");
  await add.getByRole("button", { name: "Add" }).click();
  await expect(add.getByText("AWS Cloud Practitioner added.")).toBeVisible();

  await page.goto("/cv");
  await expect(page.locator(".qualifications .degree")).toHaveText(["AWS Cloud Practitioner", "BSc Computer Science & Software Engineering", "QQI Level 5 Computer Systems and Networks"]);
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
