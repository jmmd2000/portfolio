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
  rust: { shikiID: "rust", name: "Rust" },
  rs: { shikiID: "rust", name: "Rust" },
  python: { shikiID: "python", name: "Python" },
  py: { shikiID: "python", name: "Python" },
};

/** Each kind of token that gets its own class, and the TextMate scopes that make a token that kind */
const tokenKinds = {
  keyword: ["keyword.control", "keyword.operator.new", "keyword.operator.expression", "keyword.other", "storage.type", "storage.modifier", "entity.name.tag", "keyword.operator.logical.python"],
  comment: ["comment", "punctuation.definition.comment"],
  string: ["string", "punctuation.definition.string"],
  constant: ["constant.numeric", "constant.language", "constant.character", "keyword.other.unit"],
  function: ["entity.name.function", "support.function"],
  type: ["entity.name.type", "entity.name.class", "entity.other.inherited-class", "support.type", "support.class"],
} as const;

type TokenKind = keyof typeof tokenKinds;

// The theme's colour for a kind is only a label, so the transformer can tell the kinds apart
function colourLabel(kind: TokenKind): string {
  return `var(--code-${kind})`;
}

const kindByColourLabel = new Map(Object.keys(tokenKinds).map(kind => [colourLabel(kind as TokenKind), kind]));

const labelTheme: ThemeRegistrationRaw = {
  name: "token-labels",
  type: "light",
  colors: { "editor.foreground": "var(--code-text)", "editor.background": "transparent" },
  settings: [
    { settings: { foreground: "var(--code-text)" } },
    ...Object.entries(tokenKinds).map(([kind, scopes]) => ({ scope: [...scopes], settings: { foreground: colourLabel(kind as TokenKind) } })),
  ],
};

/** Gives each token its kind as a class. The sanitiser removes Shiki's inline styles, so the classes carry the colours */
const markTokens: ShikiTransformer = {
  span(element, _line, _column, _lineElement, token) {
    const kind = token.color === undefined ? undefined : kindByColourLabel.get(token.color);
    if (kind) this.addClassToHast(element, kind);
  },
};

let highlighterLoading: Promise<Highlighter> | undefined;

/** Loads Shiki and its languages once, the first time a code block is needed */
function loadHighlighter(): Promise<Highlighter> {
  const shikiIDs = [...new Set(Object.values(languages).map(language => language.shikiID))];
  highlighterLoading ??= createHighlighter({ themes: [labelTheme], langs: shikiIDs });
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
      ? highlighter.codeToHtml(code, { lang: language.shikiID, theme: "token-labels", transformers: [markTokens] })
      : `<pre tabindex="0"><code>${escapeHTML(code)}</code></pre>`;

    return `<figure class="code-block"><figcaption>${escapeHTML(caption)}</figcaption>${highlighted}</figure>\n`;
  };
}
