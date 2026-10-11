import { createHighlighter, type Highlighter, type ShikiTransformer, type ThemeRegistrationRaw } from "shiki";

interface CodeLanguage {
  shikiID: string;
  name: string;
}

/** The fence words that get highlighting. Any other fence word shows as plain code */
const languages: Record<string, CodeLanguage> = {
  ts: { shikiID: "typescript", name: "TypeScript" },
  typescript: { shikiID: "typescript", name: "TypeScript" },
  js: { shikiID: "javascript", name: "JavaScript" },
  javascript: { shikiID: "javascript", name: "JavaScript" },
  svelte: { shikiID: "svelte", name: "Svelte" },
  html: { shikiID: "html", name: "HTML" },
  css: { shikiID: "css", name: "CSS" },
  bash: { shikiID: "bash", name: "Bash" },
  sh: { shikiID: "bash", name: "Bash" },
  shell: { shikiID: "bash", name: "Bash" },
  json: { shikiID: "json", name: "JSON" },
  sql: { shikiID: "sql", name: "SQL" },
};

// The colour values are labels for each kind of token, not real colours
const keywordColour = "var(--code-keyword)";
const commentColour = "var(--code-comment)";

const monochromeTheme: ThemeRegistrationRaw = {
  name: "monochrome",
  type: "light",
  colors: { "editor.foreground": "var(--code-text)", "editor.background": "transparent" },
  settings: [
    { settings: { foreground: "var(--code-text)" } },
    {
      scope: ["keyword.control", "keyword.operator.new", "keyword.operator.expression", "keyword.other", "storage.type", "storage.modifier"],
      settings: { foreground: keywordColour },
    },
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: commentColour } },
  ],
};

/** Gives keyword and comment tokens a class. The sanitiser removes Shiki's inline styles, so the classes carry the styling */
const markTokens: ShikiTransformer = {
  span(element, _line, _column, _lineElement, token) {
    if (token.color === keywordColour) this.addClassToHast(element, "keyword");
    if (token.color === commentColour) this.addClassToHast(element, "comment");
  },
};

let highlighterLoading: Promise<Highlighter> | undefined;

/** Loads Shiki and its languages once, the first time a code block is needed */
function loadHighlighter(): Promise<Highlighter> {
  const shikiIDs = [...new Set(Object.values(languages).map(language => language.shikiID))];
  highlighterLoading ??= createHighlighter({ themes: [monochromeTheme], langs: shikiIDs });
  return highlighterLoading;
}

function escapeHTML(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/**
 * Loads Shiki, then returns a function that turns a fenced code block into a figure: a caption with the language,
 * then the highlighted code. The returned function runs synchronously, so marked's renderer can call it.
 */
export async function createCodeBlockRenderer(): Promise<(code: string, fence: string | undefined) => string> {
  const highlighter = await loadHighlighter();

  return (code, fence) => {
    // The fence can say more than the language, like "ts title=example.ts", so only its first word counts
    const fenceWord = fence?.trim().split(/\s+/)[0] ?? "";
    const language = languages[fenceWord.toLowerCase()];
    const caption = language?.name ?? (fenceWord || "Code");

    const highlighted = language
      ? highlighter.codeToHtml(code, { lang: language.shikiID, theme: monochromeTheme.name ?? "monochrome", transformers: [markTokens] })
      : `<pre tabindex="0"><code>${escapeHTML(code)}</code></pre>`;

    return `<figure class="code-block"><figcaption>${escapeHTML(caption)}</figcaption>${highlighted}</figure>\n`;
  };
}
