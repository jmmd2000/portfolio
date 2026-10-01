import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("a signed-out visitor can't edit the profile, and the server refuses their edits", async ({ page, request }) => {
  for (const path of ["/", "/cv"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveCount(0);
  }

  const response = await request.patch("/api/admin/profile", { data: { role: "Test Lead" } });
  expect(response.status()).toBe(401);
});

test("visitors download none of the editing code", async ({ page }) => {
  for (const path of ["/", "/cv"]) {
    const scripts: Promise<string>[] = [];
    page.on("response", response => {
      if (response.request().resourceType() === "script") scripts.push(response.text());
    });

    await page.goto(path, { waitUntil: "networkidle" });

    const scriptText = await Promise.all(scripts);
    expect(scriptText.length).toBeGreaterThan(0);
    // Only the editing code turns text into an input like this
    expect(scriptText.some(text => text.includes("plaintext-only"))).toBe(false);
    page.removeAllListeners("response");
  }
});

test("the admin edits the profile by clicking it, and the change is still there after a reload", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/");

  await page.getByRole("textbox", { name: "Role" }).fill("Test Lead");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Role saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Role" })).toHaveText("Test Lead");
});

test("undo saves the old text again, not just shows it", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await page.goto("/");

  await page.getByRole("textbox", { name: "Role" }).fill("Test Lead");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Role restored.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Role" })).toHaveText("Software Engineer");
});

test("the server refuses a profile edit the page would have caught", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await expect(page).toHaveURL("/admin");

  const response = await page.request.patch("/api/admin/profile", { data: { name: "   " } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ formErrors: [], fieldErrors: { name: ["Add a name."] } });
});
