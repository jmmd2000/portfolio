import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import HomePage from "./+page.svelte";

describe("home page", () => {
  it("renders my name as the main heading", async () => {
    await render(HomePage);

    await expect.element(page.getByRole("heading", { level: 1 })).toHaveTextContent("James Doyle");
  });

  it("runs in a real browser", () => {
    expect(typeof window).toBe("object");
  });
});
