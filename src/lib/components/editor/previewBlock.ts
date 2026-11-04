import { marked } from "marked";

/**
 * The position in the rendered article of the block that holds a place in its markdown, counting from 0. Blank lines
 * count as part of the block before them. Markdown that renders nothing, such as a link definition, isn't counted.
 */
export function blockIndexAt(markdown: string, position: number): number {
  let index = -1;
  let end = 0;

  for (const token of marked.lexer(markdown)) {
    if (token.type !== "space" && token.type !== "def") index += 1;
    end += token.raw.length;
    if (position < end) break;
  }

  return Math.max(index, 0);
}
