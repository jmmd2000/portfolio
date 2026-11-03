import { renderMarkdown } from "$lib/server/markdown/renderMarkdown";
import { lookUpAlbums } from "./spotifyAlbums";

/**
 * Turns an article's markdown into HTML, with its albums looked up. `showProblems` is for the editor: it adds a note
 * where an album tag can't be shown, which the public page leaves out.
 */
export function renderArticle(markdown: string, options: { showProblems?: boolean } = {}): Promise<string> {
  return renderMarkdown(markdown, { lookUpAlbums, showProblems: options.showProblems });
}
