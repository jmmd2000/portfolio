import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./renderMarkdown";

describe("renderMarkdown", () => {
  describe("unsafe HTML", () => {
    it("removes script tags and the code inside them", () => {
      const html = renderMarkdown("Hello\n\n<script>alert('hi')</script>");

      expect(html).not.toContain("<script");
      expect(html).not.toContain("alert");
    });

    it("removes event handler attributes", () => {
      const html = renderMarkdown('<p onclick="steal()">Hello</p>\n\n<img src="https://assets.jamesmddoyle.com/cat.png" onerror="steal()">');

      expect(html).not.toContain("onclick");
      expect(html).not.toContain("onerror");
      expect(html).not.toContain("steal");
    });

    it.each(["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>alert(1)</script>", "//evil.example.com"])("removes a link to %s", href => {
      const html = renderMarkdown(`[Click](${href})`);

      expect(html).toBe("<p><a>Click</a></p>\n");
    });

    it("drops tags outside the allowlist but keeps their text", () => {
      const html = renderMarkdown('<h1>Big</h1>\n\n<iframe src="https://example.com"></iframe>\n\n<span style="color:red">Plain</span>');

      expect(html).not.toMatch(/<(h1|iframe|span)/);
      expect(html).toContain("Big");
      expect(html).toContain("Plain");
    });
  });

  describe("links", () => {
    it("marks a link to another site as external", () => {
      expect(renderMarkdown("[Svelte](https://svelte.dev)")).toBe('<p><a href="https://svelte.dev" rel="external noopener">Svelte</a></p>\n');
    });

    it("leaves links within the site and email links as they are", () => {
      const html = renderMarkdown("[Projects](/projects), [Top](#setup), [Home](https://jamesmddoyle.com/) and [Email](mailto:hi@jamesmddoyle.com)");

      expect(html).toBe('<p><a href="/projects">Projects</a>, <a href="#setup">Top</a>, <a href="https://jamesmddoyle.com/">Home</a> and <a href="mailto:hi@jamesmddoyle.com">Email</a></p>\n');
    });

    it("replaces a hand-written rel instead of keeping it", () => {
      expect(renderMarkdown('<a href="/cv" rel="opener">CV</a>')).toBe('<p><a href="/cv">CV</a></p>\n');
    });
  });

  describe("images", () => {
    it("keeps an image from the asset host with its alt text", () => {
      expect(renderMarkdown("![A cat](https://assets.jamesmddoyle.com/cat.png)")).toBe('<p><img src="https://assets.jamesmddoyle.com/cat.png" alt="A cat" /></p>\n');
    });

    it.each(["https://example.com/cat.png", "http://assets.jamesmddoyle.com/cat.png", "https://assets.jamesmddoyle.com.example.com/cat.png", "/cat.png"])("drops an image from %s", src => {
      expect(renderMarkdown(`![A cat](${src})`)).not.toContain("<img");
    });
  });

  describe("demo placeholders", () => {
    it("keeps a demo placeholder with exactly its one attribute", () => {
      expect(renderMarkdown('<div data-demo="SandBox" class="big" id="demo" onclick="steal()"></div>')).toBe('<div data-demo="SandBox"></div>');
    });

    it("drops the tag of any other div but keeps its text", () => {
      expect(renderMarkdown('<div class="note">Just text</div>')).toBe("Just text");
    });
  });

  describe("headings", () => {
    it("gives each heading an id from its text", () => {
      expect(renderMarkdown("## Getting started")).toBe('<h2 id="getting-started">Getting started</h2>\n');
    });

    it("makes the id from the heading's text without its markup or entities", () => {
      expect(renderMarkdown("### Using `marked` & *Shiki*")).toBe('<h3 id="using-marked-shiki">Using <code>marked</code> &amp; <em>Shiki</em></h3>\n');
    });

    it("numbers repeated headings so each id is unique", () => {
      const html = renderMarkdown("## Setup\n\n## Setup\n\n## Setup");

      expect(html.match(/id="[^"]+"/g)).toEqual(['id="setup"', 'id="setup-2"', 'id="setup-3"']);
    });

    it("moves headings into the h2 to h4 range", () => {
      const html = renderMarkdown("# Top\n\n##### Deep\n\n###### Deeper");

      expect(html.match(/<h\d/g)).toEqual(["<h2", "<h4", "<h4"]);
    });

    it("drops a hand-written heading id", () => {
      expect(renderMarkdown('<h2 id="main">Sneaky</h2>')).toBe("<h2>Sneaky</h2>");
    });
  });

  describe("other markdown", () => {
    it("keeps strikethrough, line breaks and table alignment", () => {
      const html = renderMarkdown("~~old~~ new  \nnext line\n\n| Left | Middle |\n| :--- | :---: |\n| a | b |");

      expect(html).toContain("<del>old</del>");
      expect(html).toContain("<br />");
      expect(html).toContain('<th align="center">Middle</th>');
    });
  });
});
