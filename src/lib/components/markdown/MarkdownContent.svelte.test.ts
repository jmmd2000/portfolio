import { afterEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import MarkdownContent from "./MarkdownContent.svelte";

const code = 'const tag = "<b>";\n\treturn tag;';

function codeBlock(language: string): string {
  return `<figure class="code-block"><figcaption>${language}</figcaption><pre tabindex="0"><code>const tag = "&lt;b&gt;";\n\treturn tag;</code></pre></figure>`;
}

describe("MarkdownContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies a code block's exact code", async () => {
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await render(MarkdownContent, { html: codeBlock("TypeScript") });

    await page.getByRole("button", { name: "Copy" }).click();

    expect(writeText).toHaveBeenCalledWith(code);
    await expect.element(page.getByText("Copied to the clipboard")).toBeInTheDocument();
  });

  it("selects the code when the clipboard is blocked", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Blocked"));
    await render(MarkdownContent, { html: codeBlock("TypeScript") });

    await page.getByRole("button", { name: "Copy" }).click();

    await expect.element(page.getByText("Selected. Copy it with your keyboard.")).toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(code);
  });

  it("gives each code block its own button again when the HTML changes", async () => {
    const { rerender } = await render(MarkdownContent, { html: codeBlock("TypeScript") });
    await expect.element(page.getByRole("button", { name: "Copy" })).toBeInTheDocument();

    await rerender({ html: codeBlock("Bash") + codeBlock("CSS") });

    await expect.poll(() => page.getByRole("button", { name: "Copy" }).all()).toHaveLength(2);
    await expect.element(page.getByText("TypeScript")).not.toBeInTheDocument();
  });
});
