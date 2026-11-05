import { Marked, type Token, type Tokens } from "marked";
import sanitizeHtml from "sanitize-html";
import type { AlbumLookup } from "$lib/server/spotify/albums";
import { slugify } from "$lib/slugify";
import { albumIDsIn, replaceAlbumTags } from "./albumCards";
import { renderChartBlock } from "./chartBlocks";
import { createCodeBlockRenderer, escapeHTML } from "./highlightCode";

const siteHost = "jamesmddoyle.com";

const topHeadingLevel = 2;
const bottomHeadingLevel = 4;

interface RenderOptions {
  /** Finds the albums in the article. Without it, each album shows a card with only its link */
  lookUpAlbums?: (ids: string[]) => Promise<Map<string, AlbumLookup>>;
  /** Adds a note where an album tag can't be shown, for the editor */
  showProblems?: boolean;
}

/**
 * Turns a heading's text into an id for its link: "Getting started" becomes "getting-started". HTML entities
 * like "&amp;" are dropped first, so "Cats &amp; dogs" becomes "cats-dogs".
 */
function slugFor(headingText: string): string {
  const slug = slugify(headingText.replace(/&[a-z0-9#]+;/gi, " "));
  return slug === "" ? "section" : slug;
}

/**
 * The words in a heading's tokens, without markdown or link addresses. marked's own text renderer returns the raw
 * markdown inside bold and italic text, which would put a link's address in the heading's id.
 */
function plainText(tokens: Token[]): string {
  return tokens
    .map(token => {
      if (token.type === "html") return "";
      if ("tokens" in token && token.tokens !== undefined) return plainText(token.tokens);
      return "text" in token && typeof token.text === "string" ? token.text : "";
    })
    .join("");
}

/** Whether any of the tokens, or the tokens inside them, is a link */
function containsLink(tokens: Token[]): boolean {
  return tokens.some(token => token.type === "link" || ("tokens" in token && token.tokens !== undefined && containsLink(token.tokens)));
}

function isExternalLink(href: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;

  try {
    const host = new URL(href).hostname;
    return host !== siteHost && host !== `www.${siteHost}`;
  } catch {
    return false;
  }
}

function isHTTPSImage(src: string | undefined): boolean {
  if (!src) return false;

  try {
    return new URL(src).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Turns an article's markdown into HTML. marked does not sanitise, so sanitize-html runs
 * last over everything with a strict allowlist. Headings get ids from their text and link to themselves, links
 * keep only safe addresses, images only load over https, and code blocks are highlighted. An image alone on its line
 * links to its own file, so it can be enlarged, and its title becomes a caption. Album tags become album cards, and
 * chart blocks become chart placeholders, which go through the same sanitising as the rest.
 */
export async function renderMarkdown(markdown: string, options: RenderOptions = {}): Promise<string> {
  const { lookUpAlbums, showProblems = false } = options;
  const renderCodeBlock = await createCodeBlockRenderer();
  let albumLookups = new Map<string, AlbumLookup>();
  // The ids this render made, so a hand-written id in raw HTML can be told apart and dropped
  const headingIDs = new Set<string>();

  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading): string {
        const level = Math.min(Math.max(depth, topHeadingLevel), bottomHeadingLevel);
        const baseID = slugFor(plainText(tokens));
        let id = baseID;
        for (let repeat = 2; headingIDs.has(id); repeat++) {
          id = `${baseID}-${repeat}`;
        }
        headingIDs.add(id);
        const content = this.parser.parseInline(tokens);
        // The heading links to its own section, unless it holds a link already, since links can't nest
        const linkedContent = containsLink(tokens) ? content : `<a class="heading-link" href="#${id}">${content}</a>`;
        return `<h${level} id="${id}">${linkedContent}</h${level}>\n`;
      },
      code({ text, lang }: Tokens.Code): string {
        if (lang === "chart") return renderChartBlock(text, showProblems);
        return renderCodeBlock(text, lang);
      },
      paragraph({ tokens }: Tokens.Paragraph): string {
        const content = this.parser.parseInline(tokens);
        const [image] = tokens;
        if (tokens.length !== 1 || image.type !== "image" || !isHTTPSImage(image.href)) return `<p>${content}</p>\n`;

        const link = `<a class="image-link" href="${escapeHTML(image.href)}">${content}</a>`;
        // A figure can't go inside a paragraph
        return image.title ? `<figure>${link}<figcaption>${escapeHTML(image.title)}</figcaption></figure>\n` : `<p>${link}</p>\n`;
      },
      html({ text }: Tokens.HTML | Tokens.Tag): string {
        return replaceAlbumTags(text, albumLookups, showProblems);
      },
    },
  });

  // The albums have to be looked up before the render, which can't wait for anything
  const tokens = marked.lexer(markdown);
  const albumIDs: string[] = [];
  void marked.walkTokens(tokens, token => {
    if (token.type === "html") albumIDs.push(...albumIDsIn(token.text));
  });
  if (lookUpAlbums) albumLookups = await lookUpAlbums(albumIDs);

  const html = marked.parser(tokens);

  /** Keeps a heading's id only when this render made it, and only on the first heading that has it */
  function keepGeneratedID(tagName: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
    const { id, ...otherAttribs } = attribs;
    if (id && headingIDs.delete(id)) return { tagName, attribs: { ...otherAttribs, id } };

    return { tagName, attribs: otherAttribs };
  }

  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "strong",
      "em",
      "del",
      "a",
      "code",
      "pre",
      "img",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "div",
      "figure",
      "figcaption",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "rel"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      img: ["src", "alt", { name: "loading", values: ["lazy"] }, { name: "referrerpolicy", values: ["no-referrer"] }],
      th: [{ name: "align", values: ["left", "center", "right"] }],
      td: [{ name: "align", values: ["left", "center", "right"] }],
      div: ["data-demo", "data-chart"],
      pre: [{ name: "tabindex", values: ["0"] }],
    },
    allowedClasses: {
      a: ["heading-link", "album-card", "image-link"],
      figure: ["code-block", "chart"],
      p: ["album-problem", "chart-problem"],
      span: ["line", "keyword", "comment", "string", "constant", "function", "type", "album-card-cover", "album-card-text", "album-card-name", "album-card-meta", "album-card-listen"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      h2: keepGeneratedID,
      h3: keepGeneratedID,
      h4: keepGeneratedID,
      // An image can come from any site, so it waits until it's near the screen and doesn't tell that site which page it's on
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", referrerpolicy: "no-referrer" } }),
      a: (tagName, attribs) => {
        const linkAttribs = { ...attribs };
        delete linkAttribs.rel;
        if (attribs.href && isExternalLink(attribs.href)) linkAttribs.rel = "external noopener";

        return { tagName, attribs: linkAttribs };
      },
    },
    exclusiveFilter: frame => {
      if (frame.tag === "img") return !isHTTPSImage(frame.attribs.src);
      // A div is only kept as a demo or chart placeholder. Any other div keeps its content but loses the tag
      if (frame.tag === "div" && frame.attribs["data-demo"] === undefined && frame.attribs["data-chart"] === undefined) return "excludeTag";

      return false;
    },
  });
}
