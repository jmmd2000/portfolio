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

test("a new article is a draft that stays off the site", async ({ page }) => {
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

  const response = await page.goto("/articles/how-the-sand-falls");
  expect(response?.status()).toBe(404);
  await page.goto("/admin/articles");
  await expect(page.getByText("Draft")).toBeVisible();
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

  await expect(add.getByText("Another article already uses this slug.")).toBeVisible();
  await expect(add.getByLabel("Title")).toHaveValue("Another");
});
