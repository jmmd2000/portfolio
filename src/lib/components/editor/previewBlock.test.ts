import { describe, expect, it } from "vitest";
import { blockIndexAt } from "./previewBlock";

const markdown = "## Heading\n\nFirst paragraph.\n\n- One\n\n- Two\n\n```ts\nconst a = 1;\n\nconst b = 2;\n```\n\nLast paragraph.";

function indexAt(text: string): number {
  return blockIndexAt(markdown, markdown.indexOf(text));
}

describe("blockIndexAt", () => {
  it("finds the block a place in the markdown belongs to", () => {
    expect(indexAt("Heading")).toBe(0);
    expect(indexAt("First")).toBe(1);
    expect(indexAt("Last")).toBe(4);
  });

  it("treats a list or a code block with blank lines in it as one block", () => {
    expect(indexAt("Two")).toBe(2);
    expect(indexAt("const b")).toBe(3);
  });

  it("counts the blank lines after a block as part of that block", () => {
    expect(blockIndexAt(markdown, markdown.indexOf("First paragraph.") + "First paragraph.\n".length)).toBe(1);
  });

  it("gives the last block at the very end of the text", () => {
    expect(blockIndexAt(markdown, markdown.length)).toBe(4);
  });

  it("doesn't count a link definition, which renders nothing", () => {
    const withDefinition = "First.\n\n[site]: https://example.com\n\nSecond.";

    expect(blockIndexAt(withDefinition, withDefinition.indexOf("Second"))).toBe(1);
  });

  it("gives the first block for empty text", () => {
    expect(blockIndexAt("", 0)).toBe(0);
  });
});
