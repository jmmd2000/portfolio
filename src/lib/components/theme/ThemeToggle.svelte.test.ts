import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { storageKey } from "./theme";
import ThemeToggle from "./ThemeToggle.svelte";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("switches to dark and saves the choice", async () => {
    document.documentElement.dataset.theme = "light";
    await render(ThemeToggle);

    await page.getByRole("button", { name: "Switch to dark theme" }).click();

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(storageKey)).toBe("dark");
    await expect.element(page.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("switches back to light and saves that too", async () => {
    document.documentElement.dataset.theme = "dark";
    await render(ThemeToggle);

    await page.getByRole("button", { name: "Switch to light theme" }).click();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(storageKey)).toBe("light");
  });

  it("offers the opposite of a theme applied before it mounted", async () => {
    document.documentElement.dataset.theme = "dark";

    await render(ThemeToggle);

    await expect.element(page.getByRole("button", { name: "Switch to light theme" })).toHaveTextContent("Light");
  });
});
