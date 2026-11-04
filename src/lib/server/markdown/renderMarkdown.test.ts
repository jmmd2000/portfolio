import { describe, expect, it, vi } from "vitest";
import type { AlbumLookup } from "$lib/server/spotify/albums";
import { renderMarkdown } from "./renderMarkdown";

/** The text a browser shows for some HTML: the tags removed and the entities turned back into characters */
function visibleText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_entity, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_entity, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&");
}

function codeIn(html: string): string {
  const match = /<code>([\s\S]*?)<\/code><\/pre>/.exec(html);
  if (!match) throw new Error(`No code block in: ${html}`);
  return visibleText(match[1]);
}

describe("renderMarkdown", () => {
  describe("unsafe HTML", () => {
    it("removes script tags and the code inside them", async () => {
      const html = await renderMarkdown("Hello\n\n<script>alert('hi')</script>");

      expect(html).not.toContain("<script");
      expect(html).not.toContain("alert");
    });

    it("removes event handler attributes", async () => {
      const html = await renderMarkdown('<p onclick="steal()">Hello</p>\n\n<img src="https://assets.jamesmddoyle.com/cat.png" onerror="steal()">');

      expect(html).not.toContain("onclick");
      expect(html).not.toContain("onerror");
      expect(html).not.toContain("steal");
    });

    it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>alert(1)</script>", "//evil.example.com"])("removes a link to %s", async href => {
      const html = await renderMarkdown(`[Click](${href})`);

      expect(html).toBe("<p><a>Click</a></p>\n");
    });

    it("drops tags outside the allowlist but keeps their text", async () => {
      const html = await renderMarkdown('<h1>Big</h1>\n\n<iframe src="https://example.com"></iframe>\n\n<font color="red">Plain</font>');

      expect(html).not.toMatch(/<(h1|iframe|font)/);
      expect(html).toContain("Big");
      expect(html).toContain("Plain");
    });
  });

  describe("links", () => {
    it("marks a link to another site as external", async () => {
      expect(await renderMarkdown("[Svelte](https://svelte.dev)")).toBe('<p><a href="https://svelte.dev" rel="external noopener">Svelte</a></p>\n');
    });

    it("leaves links within the site and email links as they are", async () => {
      const html = await renderMarkdown("[Projects](/projects), [Top](#setup), [Home](https://jamesmddoyle.com/) and [Email](mailto:hi@jamesmddoyle.com)");

      expect(html).toBe('<p><a href="/projects">Projects</a>, <a href="#setup">Top</a>, <a href="https://jamesmddoyle.com/">Home</a> and <a href="mailto:hi@jamesmddoyle.com">Email</a></p>\n');
    });

    it("replaces a hand-written rel instead of keeping it", async () => {
      expect(await renderMarkdown('<a href="/cv" rel="opener">CV</a>')).toBe('<p><a href="/cv">CV</a></p>\n');
    });
  });

  describe("images", () => {
    it("keeps an https image from any site with its alt text, loading lazily and without a referrer", async () => {
      const html = await renderMarkdown("![A cat](https://example.com/cat.png)");

      expect(html).toContain('<img src="https://example.com/cat.png" alt="A cat" loading="lazy" referrerpolicy="no-referrer" />');
    });

    it("replaces loading and referrer settings written into the HTML by hand", async () => {
      const html = await renderMarkdown('<img src="https://example.com/cat.png" alt="A cat" loading="eager" referrerpolicy="unsafe-url">');

      expect(html).toBe('<img src="https://example.com/cat.png" alt="A cat" loading="lazy" referrerpolicy="no-referrer" />');
    });

    it.each(["http://example.com/cat.png", "/cat.png", "data:image/png;base64,AAAA", "javascript:alert(1)"])("drops an image from %s", async src => {
      expect(await renderMarkdown(`![A cat](${src})`)).not.toContain("<img");
    });
  });

  describe("demo placeholders", () => {
    it("keeps a demo placeholder with exactly its one attribute", async () => {
      expect(await renderMarkdown('<div data-demo="SandBox" class="big" id="demo" onclick="steal()"></div>')).toBe('<div data-demo="SandBox"></div>');
    });

    it("drops the tag of any other div but keeps its text", async () => {
      expect(await renderMarkdown('<div class="note">Just text</div>')).toBe("Just text");
    });
  });

  describe("image captions", () => {
    const image = "![A cat](https://example.com/cat.png";

    it("shows an image's title as its caption", async () => {
      const html = await renderMarkdown(`${image} "Plum on the desk")`);

      expect(html).toContain("<figure>");
      expect(html).toContain("<figcaption>Plum on the desk</figcaption>");
      expect(html).toContain('alt="A cat"');
      expect(html).not.toContain("<p>");
    });

    it("leaves an image without a title in a paragraph", async () => {
      const html = await renderMarkdown(`${image})`);

      expect(html).toContain("<p>");
      expect(html).not.toContain("<figure");
    });

    it("gives no caption to an image inside a sentence", async () => {
      const html = await renderMarkdown(`A cat ${image} "Plum") on a desk`);

      expect(html).toContain("<p>A cat <img");
      expect(html).not.toContain("figcaption");
    });

    it("escapes the caption", async () => {
      const html = await renderMarkdown(`${image} "<script>alert(1)</script>")`);

      expect(html).not.toContain("<script");
      expect(visibleText(html)).toContain("<script>alert(1)</script>");
    });

    it("reads a quote inside a caption", async () => {
      expect(visibleText(await renderMarkdown(`${image} "The \\"good\\" chair")`))).toContain('The "good" chair');
    });

    it("leaves no empty caption behind an image that's dropped", async () => {
      expect(await renderMarkdown('![A cat](http://example.com/cat.png "Plum")')).not.toContain("figure");
    });
  });

  describe("image links", () => {
    it("links an image alone on its line to its own file", async () => {
      const html = await renderMarkdown("![A cat](https://example.com/cat.png)");

      expect(html).toContain('<a class="image-link" href="https://example.com/cat.png"');
    });

    it("links a captioned image too, and keeps the caption outside the link", async () => {
      const html = await renderMarkdown('![A cat](https://example.com/cat.png "Plum")');

      expect(html).toMatch(/<figure><a class="image-link"[^>]*><img[^>]*><\/a><figcaption>Plum<\/figcaption><\/figure>/);
    });

    it("leaves an image inside a sentence without a link", async () => {
      expect(await renderMarkdown("A cat ![A cat](https://example.com/cat.png) on a desk")).not.toContain("image-link");
    });

    it("doesn't put a link inside a link", async () => {
      const html = await renderMarkdown("[![A cat](https://example.com/cat.png)](https://example.com)");

      expect(html.match(/<a /g)).toHaveLength(1);
      expect(html).not.toContain("image-link");
    });

    it("leaves no link behind an image that's dropped", async () => {
      expect(await renderMarkdown("![A cat](http://example.com/cat.png)")).not.toContain("<a ");
    });
  });

  describe("album cards", () => {
    const id = "7EJ0OT5ZqybXxcYRa6mccM";
    const tag = `<div data-spotify-album="${id}"></div>`;
    const found: AlbumLookup = {
      status: "found",
      album: { id, name: "For Emma, Forever Ago", artists: ["Bon Iver", "S. Carey"], releaseYear: 2008, coverURL: "https://i.scdn.co/image/300" },
    };

    function lookUpWith(lookup: AlbumLookup) {
      return async (ids: string[]) => new Map(ids.map(albumID => [albumID, lookup]));
    }

    function render(markdown: string, lookup: AlbumLookup = found, showProblems = false): Promise<string> {
      return renderMarkdown(markdown, { lookUpAlbums: lookUpWith(lookup), showProblems });
    }

    it("shows the cover, name, artists, year and one link to the album", async () => {
      const html = await render(tag);

      expect(html.match(/<a /g)).toHaveLength(1);
      expect(html).toContain(`href="https://open.spotify.com/album/${id}"`);
      expect(html).toContain('src="https://i.scdn.co/image/300"');
      expect(visibleText(html)).toContain("For Emma, Forever Ago");
      expect(visibleText(html)).toContain("Bon Iver, S. Carey · 2008");
    });

    it("reads the album ID from a share link", async () => {
      const html = await render(`<div data-spotify-album="https://open.spotify.com/album/${id}?si=abc123"></div>`);

      expect(html).toContain(`href="https://open.spotify.com/album/${id}"`);
    });

    it.each([
      ["directly above a line of text", `${tag}\nThe next line`],
      ["directly below a line of text", `<div>Some text</div>\n${tag}`],
      ["inside a list item", `- An item\n\n  ${tag}`],
      ["inside a quote", `> ${tag}`],
    ])("finds a tag %s", async (_, markdown) => {
      expect(await render(markdown)).toContain('class="album-card"');
    });

    it("shows a card for every tag in one block", async () => {
      const html = await render(`${tag}\n<div data-spotify-album="4bJCKmpKgti10f3ltz6LLl"></div>`);

      expect(html.match(/class="album-card"/g)).toHaveLength(2);
    });

    it("drops anything else written on or inside the tag", async () => {
      const html = await render(`<div class="big" data-spotify-album="${id}" onclick="steal()">Stray <strong>text</strong><script>alert(1)</script></div>`);

      expect(html).toContain('class="album-card"');
      expect(html).not.toContain("big");
      expect(html).not.toContain("steal");
      expect(html).not.toContain("Stray");
      expect(html).not.toContain("script");
    });

    it("escapes the details from Spotify", async () => {
      const lookup: AlbumLookup = {
        status: "found",
        album: { id, name: "<b>Live</b>", artists: ['"><script>alert(1)</script>'], releaseYear: 2008, coverURL: 'https://i.scdn.co/"onerror="steal()' },
      };
      const html = await render(tag, lookup);

      expect(html).not.toContain("<b>");
      expect(html).not.toContain("<script");
      expect(html).toContain('src="https://i.scdn.co/&quot;onerror=&quot;steal()"');
      expect(visibleText(html)).toContain("<b>Live</b>");
    });

    it("leaves a tag shown as an example in a code block alone", async () => {
      const html = await render("```html\n" + tag + "\n```");

      expect(html).not.toContain('class="album-card"');
      expect(codeIn(html)).toBe(tag);
    });

    it("shows nothing for a tag in the middle of a sentence", async () => {
      const html = await render(`See ${tag} here`);

      expect(html).not.toContain("album-card");
      expect(visibleText(html)).toContain("See");
      expect(visibleText(html)).toContain("here");
    });

    it("shows a card with only the link when Spotify can't be reached", async () => {
      const html = await render(tag, { status: "unreachable" });

      expect(html).toContain(`href="https://open.spotify.com/album/${id}"`);
      expect(html).not.toContain("<img");
      expect(visibleText(html)).toBe("Listen on Spotify");
    });

    it("keeps the cover's place in a card for an album with no cover", async () => {
      const album = { id, name: "Bare", artists: [], releaseYear: 2008, coverURL: null };
      const html = await render(tag, { status: "found", album });

      expect(html).toContain('<span class="album-card-cover"></span>');
      expect(visibleText(html)).toContain("Bare");
    });

    describe.each([
      ["a value that isn't an album", '<div data-spotify-album="not an album"></div>', "not an album"],
      ["an album Spotify doesn't know", tag, id],
    ])("for %s", (_, markdown, shownValue) => {
      const lookup: AlbumLookup = { status: "unknown" };

      it("shows nothing on the public page", async () => {
        expect(await render(markdown, lookup)).toBe("");
      });

      it("shows a note with the value in the editor", async () => {
        const html = await render(markdown, lookup, true);

        expect(html).toContain('class="album-problem"');
        expect(visibleText(html)).toContain(shownValue);
      });
    });

    it("escapes the value in the editor's note", async () => {
      const html = await render('<div data-spotify-album="<img src=x onerror=steal()>"></div>', found, true);

      expect(html).not.toContain("<img");
    });

    it("only looks up well-formed IDs", async () => {
      const lookUpAlbums = vi.fn(lookUpWith(found));

      await renderMarkdown(`<div data-spotify-album="half typed"></div>\n\n${tag}`, { lookUpAlbums });

      expect(lookUpAlbums).toHaveBeenCalledWith([id]);
    });
  });

  describe("headings", () => {
    it("gives each heading an id from its text, and links the heading to it", async () => {
      expect(await renderMarkdown("## Getting started")).toBe('<h2 id="getting-started"><a class="heading-link" href="#getting-started">Getting started</a></h2>\n');
    });

    it("doesn't link a heading that already holds a link, since links can't nest", async () => {
      const html = await renderMarkdown("## Read **[the docs](https://svelte.dev)**");

      expect(html).toContain('<strong><a href="https://svelte.dev" rel="external noopener">the docs</a></strong>');
      expect(html).not.toContain("heading-link");
    });

    it("leaves an author's own link to a section looking like a normal link", async () => {
      const html = await renderMarkdown("## See [setup](#setup)");

      expect(html).toContain('<a href="#setup">setup</a>');
      expect(html).not.toContain("heading-link");
    });

    it("makes the id from the heading's text without its markup or entities", async () => {
      expect(await renderMarkdown("### Using `marked` & *Shiki*")).toBe(
        '<h3 id="using-marked-shiki"><a class="heading-link" href="#using-marked-shiki">Using <code>marked</code> &amp; <em>Shiki</em></a></h3>\n'
      );
    });

    it("leaves a link's address out of the id, even inside bold text", async () => {
      expect(await renderMarkdown("## Read **[the docs](https://svelte.dev)**")).toContain('<h2 id="read-the-docs">');
    });

    it("numbers repeated headings so each id is unique", async () => {
      const html = await renderMarkdown("## Setup\n\n## Setup\n\n## Setup");

      expect(html.match(/id="[^"]+"/g)).toEqual(['id="setup"', 'id="setup-2"', 'id="setup-3"']);
    });

    it("moves headings into the h2 to h4 range", async () => {
      const html = await renderMarkdown("# Top\n\n##### Deep\n\n###### Deeper");

      expect(html.match(/<h\d/g)).toEqual(["<h2", "<h4", "<h4"]);
    });

    it("drops a hand-written heading id", async () => {
      expect(await renderMarkdown('<h2 id="main">Sneaky</h2>')).toBe("<h2>Sneaky</h2>");
    });
  });

  describe("other markdown", () => {
    it("keeps strikethrough, line breaks and table alignment", async () => {
      const html = await renderMarkdown("~~old~~ new  \nnext line\n\n| Left | Middle |\n| :--- | :---: |\n| a | b |");

      expect(html).toContain("<del>old</del>");
      expect(html).toContain("<br />");
      expect(html).toContain('<th align="center">Middle</th>');
    });
  });

  describe("code blocks", () => {
    const trickyCode = 'const tag = "<script>alert(1)</script>";\n\tconst entity = "&amp; &lt;";\n// a </code></pre> inside   \nreturn tag;';

    it("shows the language in a caption", async () => {
      const html = await renderMarkdown("```ts\nconst a = 1;\n```");

      expect(html).toMatch(/^<figure class="code-block"><figcaption>TypeScript<\/figcaption><pre tabindex="0"><code>/);
    });

    it("shows an unknown language as typed, and still captions a block with no language", async () => {
      expect(await renderMarkdown("```Zig\nconst x = 1;\n```")).toContain('<figcaption>Zig</figcaption><pre tabindex="0"><code>const x = 1;</code></pre>');
      expect(await renderMarkdown("```\nplain\n```")).toContain("<figcaption>");
    });

    it("only uses the first word of the fence", async () => {
      expect(await renderMarkdown("```ts title=example.ts\nconst a = 1;\n```")).toContain("<figcaption>TypeScript</figcaption>");
    });

    it("marks each kind of token with a class and keeps no inline styles", async () => {
      const html = await renderMarkdown('```ts\n// note\nconst size: number = measure("sand", 2);\nfunction measure() {}\n```');

      expect(html).toContain('<span class="comment">// note</span>');
      expect(html).toContain('<span class="keyword">const</span>');
      expect(html).toContain('<span class="type">number</span>');
      expect(html).toContain('<span class="function">measure</span>');
      expect(html).toMatch(/<span class="string">"?sand/);
      expect(html).toContain('<span class="constant">2</span>');
      expect(html).not.toContain("style=");
    });

    it("keeps highlighted code's text exactly", async () => {
      const html = await renderMarkdown(`\`\`\`ts\n${trickyCode}\n\`\`\``);

      expect(codeIn(html)).toBe(trickyCode);
      expect(html).not.toContain("<script");
    });

    it("keeps plain code's text exactly", async () => {
      const html = await renderMarkdown(`\`\`\`\n${trickyCode}\n\`\`\``);

      expect(codeIn(html)).toBe(trickyCode);
      expect(html).not.toContain("<script");
    });

    it("shows HTML in the fence's language word as text", async () => {
      const html = await renderMarkdown("```<em>Bold</em>\ncode\n```");

      expect(html).toContain("<figcaption>&lt;em&gt;Bold&lt;/em&gt;</figcaption>");
    });

    it("drops classes and styles that hand-written HTML adds to code markup", async () => {
      const html = await renderMarkdown('<figure class="code-block evil"><span class="keyword evil" style="color:red">x</span></figure>');

      expect(html).toBe('<figure class="code-block"><span class="keyword">x</span></figure>');
    });
  });
});
