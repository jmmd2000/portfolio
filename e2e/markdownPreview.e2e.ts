import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("the preview endpoint refuses a signed-out visitor", async ({ request }) => {
  const response = await request.post("/api/admin/markdown-preview", { data: { markdown: "## Hello" } });

  expect(response.status()).toBe(401);
});

test("the preview endpoint renders sanitised markdown for the admin", async ({ page }) => {
  await createAdmin();
  await logIn(page);

  const response = await page.request.post("/api/admin/markdown-preview", { data: { markdown: "## Hello\n\n<script>alert(1)</script>" } });

  expect(response.status()).toBe(200);
  const { html } = (await response.json()) as { html: string };
  expect(html).toContain('<h2 id="hello">Hello</h2>');
  expect(html).not.toContain("<script");
});

test("the preview endpoint refuses a request without markdown", async ({ page }) => {
  await createAdmin();
  await logIn(page);

  const response = await page.request.post("/api/admin/markdown-preview", { data: { text: "## Hello" } });

  expect(response.status()).toBe(400);
});
