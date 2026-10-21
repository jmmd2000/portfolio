import { createAdmin, logIn } from "./adminSession";
import { insertArticle } from "./articles";
import { expect, test } from "./fixtures";

test("a signed-out visitor can't add an article", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/articles?/add", { headers: { origin: baseURL ?? "" }, form: { title: "Spam", slug: "spam", summary: "Spam" } });

  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  await expect(page.getByText("No articles yet.")).toBeVisible();
});

test("a new article is a draft that stays off the site", async ({ page, request }) => {
  await createAdmin();
  await logIn(page);
  await page.getByRole("main").getByRole("link", { name: "Articles" }).click();

  const add = page.getByRole("group", { name: "Add an article" });
  await add.getByLabel("Title").fill("How the sand falls");
  await add.getByLabel("Slug").fill("how-the-sand-falls");
  await add.getByLabel("Summary").fill("One rule per material.");
  await add.getByRole("button", { name: "Add" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How the sand falls");
  await page.getByLabel("Body").fill("## The grid");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("How the sand falls saved.")).toBeVisible();

  // A signed-out visitor, since the signed-in admin can see drafts
  const response = await request.get("/articles/how-the-sand-falls");
  expect(response.status()).toBe(404);
  await page.goto("/admin/articles");
  await expect(page.getByText("Draft")).toBeVisible();
});

test("a new article's slug follows its title until the slug is typed by hand", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  const add = page.getByRole("group", { name: "Add an article" });

  await add.getByLabel("Title").fill("How the Sand Falls!");
  await expect(add.getByLabel("Slug")).toHaveValue("how-the-sand-falls");
  await add.getByLabel("Slug").fill("sand");
  await add.getByLabel("Title").fill("Falling sand");

  await expect(add.getByLabel("Slug")).toHaveValue("sand");
});

test("without JavaScript, a new article with a blank slug gets one from its title", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  // Blocking the app's JavaScript makes the form submit as plain HTML
  await page.route("**/_app/**/*.js", route => route.abort());
  await page.goto("/admin/articles");
  const add = page.getByRole("group", { name: "Add an article" });

  await add.getByLabel("Title").fill("How the Sand Falls");
  await add.getByLabel("Summary").fill("One rule per material.");
  await add.getByRole("button", { name: "Add" }).click();

  await page.locator("summary", { hasText: "Details" }).click();
  await expect(page.getByLabel("Slug")).toHaveValue("how-the-sand-falls");
});

test("a slug another article uses is reported on the field", async ({ page }) => {
  await insertArticle({ slug: "taken" });
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");

  const add = page.getByRole("group", { name: "Add an article" });
  await add.getByLabel("Title").fill("Another");
  await add.getByLabel("Slug").fill("taken");
  await add.getByLabel("Summary").fill("Clashes.");
  await add.getByRole("button", { name: "Add" }).click();

  await expect(add.getByText("Another article uses or used this slug.")).toBeVisible();
  await expect(add.getByLabel("Title")).toHaveValue("Another");
});

test("publishing an article puts it on the site as a write-up for its project", async ({ page }) => {
  await insertArticle({ slug: "how-the-sand-falls", published: false, publishedAt: null });
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  await page.getByRole("link", { name: "How the sand falls" }).click();

  await page.locator("summary", { hasText: "Details" }).click();
  await page.getByLabel("Write-up for").selectOption({ label: "SandSim" });
  await page.getByLabel("Published").check();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Published.")).toBeVisible();

  await page.goto("/projects");
  await expect(page.getByRole("link", { name: "Read the write-up for SandSim" })).toBeVisible();
});

test("renaming a published article sends its old address to the new one", async ({ page }) => {
  await insertArticle({ slug: "how-the-sand-falls" });
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  await page.getByRole("link", { name: "How the sand falls" }).click();

  await page.locator("summary", { hasText: "Details" }).click();
  await page.getByLabel("Slug").fill("falling-sand");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("How the sand falls saved.")).toBeVisible();

  const response = await page.request.get("/articles/how-the-sand-falls", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()["location"]).toBe("/articles/falling-sand");
  expect(response.headers()["cache-control"]).toBe("max-age=86400");
});

test("deleting an article asks first, then removes it from the admin and the site", async ({ page }) => {
  await insertArticle({ slug: "how-the-sand-falls" });
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/articles");
  await page.getByRole("link", { name: "How the sand falls" }).click();

  await page.locator("summary", { hasText: "Details" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Keep" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How the sand falls");

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Delete How the sand falls" }).click();

  await expect(page.getByText("No articles yet.")).toBeVisible();
  const response = await page.goto("/articles/how-the-sand-falls");
  expect(response?.status()).toBe(404);
});

for (const javaScript of [true, false]) {
  test(`${javaScript ? "with" : "without"} JavaScript, a slug clash in the editor opens the details to show it and keeps the body`, async ({ page }) => {
    await insertArticle({ slug: "taken", title: "Taken" });
    await insertArticle({ slug: "how-the-sand-falls", published: false, publishedAt: null });
    await createAdmin();
    await logIn(page);
    // Blocking the app's JavaScript makes the form submit as plain HTML
    if (!javaScript) await page.route("**/_app/**/*.js", route => route.abort());
    await page.goto("/admin/articles");
    await page.getByRole("link", { name: "How the sand falls" }).click();

    await page.locator("summary", { hasText: "Details" }).click();
    await page.getByLabel("Slug").fill("taken");
    await page.getByLabel("Body").fill("A body that should still be here.");
    await page.locator("summary", { hasText: "Details" }).click();
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Another article uses or used this slug.")).toBeVisible();
    await expect(page.getByLabel("Body")).toHaveValue("A body that should still be here.");
  });
}
