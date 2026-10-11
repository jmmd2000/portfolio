import { Marked, type Tokens } from "marked";
import sanitizeHtml from "sanitize-html";

const imageHost = "assets.jamesmddoyle.com";
const siteHost = "jamesmddoyle.com";

/** The first heading level an article uses, below the page's own h1, and the last */
const topHeadingLevel = 2;
const bottomHeadingLevel = 4;

/**
 * Turns a heading's text into an id for its link: "Getting started" becomes "getting-started". HTML entities
 * like "&amp;" are dropped first, so "Cats &amp; dogs" becomes "cats-dogs".
 */
function slugFor(headingText: string): string {
  const slug = headingText
    .replace(/&[a-z0-9#]+;/gi, " ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug === "" ? "section" : slug;
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

function isAllowedImage(src: string | undefined): boolean {
  if (!src) return false;

  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === imageHost;
  } catch {
    return false;
  }
}

/**
 * Turns an article's markdown into HTML. marked does not sanitise, so sanitize-html runs
 * last over everything with a strict allowlist. Headings get ids from their text, links
 * keep only safe addresses, and images only come from the site's asset host.
 */
export function renderMarkdown(markdown: string): string {
  // The ids this render made, so a hand-written id in raw HTML can be told apart and dropped
  const headingIDs = new Set<string>();

  const marked = new Marked({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading): string {
        const level = Math.min(Math.max(depth, topHeadingLevel), bottomHeadingLevel);
        const baseID = slugFor(this.parser.parseInline(tokens, this.parser.textRenderer));
        let id = baseID;
        for (let repeat = 2; headingIDs.has(id); repeat++) {
          id = `${baseID}-${repeat}`;
        }
        headingIDs.add(id);
        return `<h${level} id="${id}">${this.parser.parseInline(tokens)}</h${level}>\n`;
      },
    },
  });

  const html = marked.parse(markdown, { async: false });

  /** Keeps a heading's id only when this render made it, and only on the first heading that has it */
  function keepGeneratedID(tagName: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
    const { id, ...otherAttribs } = attribs;
    if (id && headingIDs.delete(id)) return { tagName, attribs: { ...otherAttribs, id } };

    return { tagName, attribs: otherAttribs };
  }

  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "strong", "em", "del", "a", "code", "pre", "img", "hr", "table", "thead", "tbody", "tr", "th", "td", "div"],
    allowedAttributes: {
      a: ["href", "rel"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      img: ["src", "alt"],
      th: [{ name: "align", values: ["left", "center", "right"] }],
      td: [{ name: "align", values: ["left", "center", "right"] }],
      div: ["data-demo"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      h2: keepGeneratedID,
      h3: keepGeneratedID,
      h4: keepGeneratedID,
      a: (tagName, attribs) => {
        const linkAttribs = { ...attribs };
        delete linkAttribs.rel;
        if (attribs.href && isExternalLink(attribs.href)) linkAttribs.rel = "external noopener";

        return { tagName, attribs: linkAttribs };
      },
    },
    exclusiveFilter: frame => {
      if (frame.tag === "img") return !isAllowedImage(frame.attribs.src);
      // A div is only kept as a demo placeholder. Any other div keeps its content but loses the tag
      if (frame.tag === "div" && frame.attribs["data-demo"] === undefined) return "excludeTag";

      return false;
    },
  });
}
