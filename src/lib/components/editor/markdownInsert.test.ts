import { describe, expect, it } from "vitest";
import { applyMarkup, shortcutMarkup, type Markup, type TextSelection } from "./markdownInsert";

const bold: Markup = { kind: "wrap", before: "**", after: "**", placeholder: "bold text" };
const link: Markup = { kind: "wrap", before: "[", after: "](https://)", placeholder: "link text", selectInAfter: "https://" };
const list: Markup = { kind: "line", prefix: "- " };
const rule: Markup = { kind: "block", block: "---", select: "" };
const codeBlock: Markup = { kind: "block", block: "```ts\ncode\n```", select: "code" };

/** The text with the new selection shown as [ and ], so a test reads like the editor would look */
function show({ text, start, end }: TextSelection): string {
  return `${text.slice(0, start)}[${text.slice(start, end)}]${text.slice(end)}`;
}

/** A selection from text with [ and ] marking what's selected */
function selection(marked: string): TextSelection {
  const start = marked.indexOf("[");
  const end = marked.indexOf("]") - 1;
  return { text: marked.replace("[", "").replace("]", ""), start, end };
}

describe("wrapping", () => {
  it("wraps the selected text and keeps it selected", () => {
    expect(show(applyMarkup(selection("Each [cell] holds"), bold))).toBe("Each **[cell]** holds");
  });

  it("inserts a selected placeholder at the cursor when nothing is selected", () => {
    expect(show(applyMarkup(selection("Each []holds"), bold))).toBe("Each **[bold text]**holds");
  });

  it("selects a link's address when text was selected, so it can be typed straight away", () => {
    expect(show(applyMarkup(selection("See [the docs] here"), link))).toBe("See [the docs]([https://]) here");
  });

  it("selects a link's placeholder text when nothing was selected", () => {
    expect(show(applyMarkup(selection("See []"), link))).toBe("See [[link text]](https://)");
  });
});

describe("line prefixes", () => {
  it("starts the cursor's line with the prefix, wherever the cursor is on the line", () => {
    expect(show(applyMarkup(selection("Intro\nCheap to[] update\nOutro"), list))).toBe("Intro\n- Cheap to[] update\nOutro");
  });

  it("starts every selected line with the prefix", () => {
    expect(show(applyMarkup(selection("Intro\nCh[eap\nEasy]\nOutro"), list))).toBe("Intro\n- Ch[eap\n- Easy]\nOutro");
  });

  it("prefixes the first line of the text", () => {
    expect(show(applyMarkup(selection("[]Cheap"), list))).toBe("- []Cheap");
  });
});

describe("blocks", () => {
  it("puts a block on its own lines with a blank line either side, after the selection", () => {
    expect(show(applyMarkup(selection("One [two] three"), codeBlock))).toBe("One two\n\n```ts\n[code]\n```\n\n three");
  });

  it("adds only the line breaks that are missing", () => {
    expect(show(applyMarkup(selection("First paragraph.\n[]\nSecond."), rule))).toBe("First paragraph.\n\n---[]\n\nSecond.");
  });

  it("adds no line breaks where a blank line already is", () => {
    expect(show(applyMarkup(selection("First paragraph.\n\n[]\n\nSecond."), rule))).toBe("First paragraph.\n\n---[]\n\nSecond.");
  });

  it("adds no blank lines at the very start or end of the text", () => {
    expect(show(applyMarkup(selection("[]"), rule))).toBe("---[]");
  });
});

describe("shortcuts", () => {
  it("finds the markup for a shortcut letter, whatever its case", () => {
    expect(shortcutMarkup("b")).toEqual({ kind: "wrap", before: "**", after: "**", placeholder: "bold text" });
    expect(shortcutMarkup("K")).toMatchObject({ before: "[", after: "](https://)" });
  });

  it("has nothing for a letter without a shortcut", () => {
    expect(shortcutMarkup("s")).toBeUndefined();
  });
});
