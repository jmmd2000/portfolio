import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

const seededLegends = ["Listening: Bon Iver, Bon Iver", "Playing: Fallout 4", "Watching: Breaking Bad", "Reading: To Kill a Mockingbird"];

test("a signed-out visitor can't add a row", async ({ page, request, baseURL }) => {
  // The origin header gets the request past SvelteKit's cross-site check, so it reaches the sign-in check
  await request.post("/admin/currently?/add", { headers: { origin: baseURL ?? "" }, form: { label: "Spam", title: "Spam", subtitle: "", url: "", imageURL: "", shown: "on" } });

  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");
  await expect(page.locator(".rows legend")).toHaveText(seededLegends);
});

test("the admin moves a row without opening it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/admin/currently");

  const fallout = page.getByRole("listitem").filter({ hasText: "Playing: Fallout 4" });
  await fallout.getByRole("button", { name: "Move down" }).click();

  await expect(page.locator(".rows legend")).toHaveText(["Listening: Bon Iver, Bon Iver", "Watching: Breaking Bad", "Playing: Fallout 4", "Reading: To Kill a Mockingbird"]);
});
