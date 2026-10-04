import type { Page } from "@playwright/test";
import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

const seededNames = ["JamesReviewsMusic", "Phantom", "SandSim", "Issues", "Vintage Recreations"];

async function publicProjectNames(page: Page): Promise<string[]> {
  await page.goto("/projects");
  return page.locator(".bands h2").allTextContents();
}

test("a signed-out visitor can't add a project", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/projects?/add", { headers: { origin: baseURL ?? "" }, form: { title: "Spam", description: "Spam", imageURL: "https://example.com/spam.png" } });

  await createAdmin();
  await logIn(page);
  await page.goto("/admin/projects");
  await expect(page.locator(".projects .name")).toHaveText(seededNames);
});

test("a new project stays off the site until it's published", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("main").getByRole("link", { name: "Projects" }).click();

  const add = page.getByRole("group", { name: "Add a project" });
  await add.getByLabel("Name").fill("Plum");
  await add.getByLabel("One-liner").fill("A shared pet for the site.");
  await add.getByLabel("Screenshot URL").fill("https://assets.jamesmddoyle.com/plum.webp");
  await add.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plum");
  const projectPage = page.url();
  expect(await publicProjectNames(page)).toEqual(seededNames);

  await page.goto(projectPage);
  await page.getByLabel("Published").check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Plum saved.")).toBeVisible();

  expect(await publicProjectNames(page)).toEqual([...seededNames, "Plum"]);
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

test("the admin moves a project up, and the projects page follows", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/projects");

  await page.getByRole("listitem").filter({ hasText: "Issues" }).getByRole("button", { name: "Move up" }).click();
  await expect(page.locator(".projects .name")).toHaveText(["JamesReviewsMusic", "Phantom", "Issues", "SandSim", "Vintage Recreations"]);

  expect(await publicProjectNames(page)).toEqual(["JamesReviewsMusic", "Phantom", "Issues", "SandSim", "Vintage Recreations"]);
});

test("deleting a project returns to the list without it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/projects");
  await page.getByRole("link", { name: "Issues" }).click();

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete Issues" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  await expect(page.locator(".projects .name")).toHaveText(["JamesReviewsMusic", "Phantom", "SandSim", "Vintage Recreations"]);
});

test("the preview follows what's typed, before it's saved", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/projects");
  await page.getByRole("link", { name: "Phantom" }).click();

  const preview = page.locator(".preview");
  await expect(preview.getByRole("heading", { level: 3 })).toHaveText("Phantom");

  await page.getByLabel("Name").fill("Phantom 2");
  await page.getByLabel("Live link text").fill("Try it");
  await expect(preview.getByRole("heading", { level: 3 })).toHaveText("Phantom 2");
  await expect(preview.getByRole("link", { name: "Try it" })).toBeVisible();

  await page.goto("/projects");
  await expect(page.locator(".bands h2")).toContainText(["Phantom"]);
  await expect(page.locator(".bands h2").filter({ hasText: "Phantom 2" })).toHaveCount(0);
});
