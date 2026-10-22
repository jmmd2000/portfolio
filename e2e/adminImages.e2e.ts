import { createAdmin, logIn } from "./adminSession";
import { expect, test } from "./fixtures";

test("the images API refuses files that aren't images, and images over 10 MB", async ({ page }) => {
  await createAdmin();
  await logIn(page);
  await expect(page).toHaveURL("/admin/profile");
  // A browser sends its origin with every upload, and SvelteKit refuses form posts without it
  const headers = { origin: new URL(page.url()).origin };

  const notAnImage = await page.request.post("/api/admin/images", {
    headers,
    multipart: { file: { name: "notes.png", mimeType: "image/png", buffer: Buffer.from("not really a picture") } },
  });
  expect(notAnImage.status()).toBe(415);

  const tooBig = Buffer.alloc(10 * 1024 * 1024 + 1);
  tooBig.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const overLimit = await page.request.post("/api/admin/images", { headers, multipart: { file: { name: "huge.png", mimeType: "image/png", buffer: tooBig } } });
  expect(overLimit.status()).toBe(413);
});
