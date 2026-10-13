/** Some text and the part of it that's selected. When start and end are the same, it's just the cursor */
export interface TextSelection {
  text: string;
  start: number;
  end: number;
}

/** Wraps the selected text, or a placeholder when nothing is selected, and selects what's inside */
interface WrapMarkup {
  kind: "wrap";
  before: string;
  after: string;
  placeholder: string;
  /** Selects this part of `after` instead when text was selected, such as a link's address */
  selectInAfter?: string;
}

/** Starts the cursor's line, or every selected line, with a prefix */
interface LineMarkup {
  kind: "line";
  prefix: string;
}

/** Puts a block on its own lines after the selection, with a blank line either side, and selects part of it */
interface BlockMarkup {
  kind: "block";
  block: string;
  /** The part of the block to select, or "" to put the cursor after it */
  select: string;
}

export type Markup = WrapMarkup | LineMarkup | BlockMarkup;

export interface MarkdownEntry {
  name: string;
  /** The syntax as the reference shows it */
  syntax: string;
  markup: Markup;
}

export interface MarkdownGroup {
  name: string;
  entries: MarkdownEntry[];
}

/** Everything an article can use, in the order the editor's reference lists it */
export const markdownGroups: MarkdownGroup[] = [
  {
    name: "Text",
    entries: [
      { name: "Bold", syntax: "**text**", markup: { kind: "wrap", before: "**", after: "**", placeholder: "bold text" } },
      { name: "Italic", syntax: "*text*", markup: { kind: "wrap", before: "*", after: "*", placeholder: "italic text" } },
      { name: "Strikethrough", syntax: "~~text~~", markup: { kind: "wrap", before: "~~", after: "~~", placeholder: "struck text" } },
      { name: "Link", syntax: "[text](https://…)", markup: { kind: "wrap", before: "[", after: "](https://)", placeholder: "link text", selectInAfter: "https://" } },
      { name: "Inline code", syntax: "`code`", markup: { kind: "wrap", before: "`", after: "`", placeholder: "code" } },
    ],
  },
  {
    name: "Blocks",
    entries: [
      { name: "Heading", syntax: "## Heading", markup: { kind: "line", prefix: "## " } },
      { name: "Subheading", syntax: "### Subheading", markup: { kind: "line", prefix: "### " } },
      { name: "List", syntax: "- item", markup: { kind: "line", prefix: "- " } },
      { name: "Numbered list", syntax: "1. item", markup: { kind: "line", prefix: "1. " } },
      { name: "Quote", syntax: "> quote", markup: { kind: "line", prefix: "> " } },
      { name: "Code block", syntax: "```ts … ```", markup: { kind: "block", block: "```ts\ncode\n```", select: "code" } },
      { name: "Table", syntax: "| a | b |", markup: { kind: "block", block: "| Column | Column |\n| --- | --- |\n| Cell | Cell |", select: "Column" } },
      { name: "Rule", syntax: "---", markup: { kind: "block", block: "---", select: "" } },
    ],
  },
  {
    name: "Media",
    entries: [
      { name: "Image", syntax: "![alt](https://…)", markup: { kind: "block", block: "![Alt text](https://)", select: "Alt text" } },
      { name: "Demo", syntax: '<div data-demo="Name">', markup: { kind: "block", block: '<div data-demo="Name"></div>', select: "Name" } },
    ],
  },
];

function wrap({ text, start, end }: TextSelection, markup: WrapMarkup): TextSelection {
  const selected = text.slice(start, end);
  const inner = selected === "" ? markup.placeholder : selected;
  const innerStart = start + markup.before.length;
  const newText = text.slice(0, start) + markup.before + inner + markup.after + text.slice(end);

  if (selected !== "" && markup.selectInAfter !== undefined) {
    const selectStart = innerStart + inner.length + markup.after.indexOf(markup.selectInAfter);
    return { text: newText, start: selectStart, end: selectStart + markup.selectInAfter.length };
  }
  return { text: newText, start: innerStart, end: innerStart + inner.length };
}

function prefixLines({ text, start, end }: TextSelection, markup: LineMarkup): TextSelection {
  const firstLineStart = text.lastIndexOf("\n", start - 1) + 1;
  const lines = text.slice(firstLineStart, end).split("\n");
  const prefixed = lines.map(line => markup.prefix + line).join("\n");
  const newText = text.slice(0, firstLineStart) + prefixed + text.slice(end);

  return { text: newText, start: start + markup.prefix.length, end: end + markup.prefix.length * lines.length };
}

/** The line breaks that leave a blank line between the block and the text next to it, and none at the very start or end */
function blankLineBefore(textBefore: string): string {
  if (textBefore === "" || textBefore.endsWith("\n\n")) return "";
  return textBefore.endsWith("\n") ? "\n" : "\n\n";
}

function blankLineAfter(textAfter: string): string {
  if (textAfter === "" || textAfter.startsWith("\n\n")) return "";
  return textAfter.startsWith("\n") ? "\n" : "\n\n";
}

function insertBlock({ text, end }: TextSelection, markup: BlockMarkup): TextSelection {
  const textBefore = text.slice(0, end);
  const textAfter = text.slice(end);
  const blockStart = textBefore.length + blankLineBefore(textBefore).length;
  const newText = textBefore + blankLineBefore(textBefore) + markup.block + blankLineAfter(textAfter) + textAfter;

  if (markup.select === "") return { text: newText, start: blockStart + markup.block.length, end: blockStart + markup.block.length };
  const selectStart = blockStart + markup.block.indexOf(markup.select);
  return { text: newText, start: selectStart, end: selectStart + markup.select.length };
}

/**
 * Applies markup to some text at the selection, and returns the new text with what to select next. Wrapping keeps the
 * selected text inside the markup, a line prefix goes at the start of every selected line, and a block goes on its
 * own lines after the selection.
 */
export function applyMarkup(selection: TextSelection, markup: Markup): TextSelection {
  if (markup.kind === "wrap") return wrap(selection, markup);
  if (markup.kind === "line") return prefixLines(selection, markup);
  return insertBlock(selection, markup);
}
