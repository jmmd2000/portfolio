export interface CodeLanguage {
  shikiID: string;
  name: string;
}

/** The fence words that get highlighting. Any other fence word shows as plain code */
export const codeLanguages: Record<string, CodeLanguage> = {
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

export interface CodeLanguageNames {
  name: string;
  fenceWords: string[];
}

/** Each highlighted language once, with every fence word that picks it, in the order of the list above */
export function codeLanguageNames(): CodeLanguageNames[] {
  const byName = new Map<string, string[]>();
  for (const [fenceWord, language] of Object.entries(codeLanguages)) {
    byName.set(language.name, [...(byName.get(language.name) ?? []), fenceWord]);
  }
  return [...byName].map(([name, fenceWords]) => ({ name, fenceWords }));
}
