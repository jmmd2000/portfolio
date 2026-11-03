import { joinSubtitle } from "$lib/server/covers/coverResult";
import { parseAlbumReference, type AlbumLookup } from "$lib/server/spotify/albums";
import { escapeHTML } from "./highlightCode";

/**
 * An album tag, with whatever else is written on it or inside it. marked keeps everything up to the next blank line in
 * one block of HTML, so a tag can have other text beside it and this can't match a whole block.
 */
const albumTagPattern = /<div\s[^>]*data-spotify-album="([^"]*)"[^>]*>[\s\S]*?<\/div>/g;

/** The album IDs in a block of HTML, leaving out any tag whose value isn't an album ID or link */
export function albumIDsIn(html: string): string[] {
  const references = [...html.matchAll(albumTagPattern)].map(match => parseAlbumReference(match[1]));
  return references.filter(id => id !== null);
}

function albumCard(id: string, lookup: AlbumLookup | undefined): string {
  const album = lookup?.status === "found" ? lookup.album : null;
  const cover = album?.coverURL ? `<img src="${escapeHTML(album.coverURL)}" alt="">` : "";
  const details = album
    ? `<span class="album-card-name">${escapeHTML(album.name)}</span><span class="album-card-meta">${escapeHTML(joinSubtitle(album.artists.join(", "), album.releaseYear) ?? "")}</span>`
    : "";

  return (
    `<a class="album-card" href="https://open.spotify.com/album/${id}">` +
    `<span class="album-card-cover">${cover}</span>` +
    `<span class="album-card-text">${details}<span class="album-card-listen">Listen on Spotify</span></span>` +
    "</a>"
  );
}

function albumProblem(message: string, value: string): string {
  return `<p class="album-problem"><strong>${message}</strong><code>${escapeHTML(value)}</code>Readers won't see this.</p>`;
}

/**
 * Replaces each album tag in a block of HTML with its card. A tag with a bad value, or an album Spotify doesn't know,
 * becomes a note when `showProblems` is true and nothing when it's false. An album with no answer gets a card with only
 * its link.
 */
export function replaceAlbumTags(html: string, lookups: Map<string, AlbumLookup>, showProblems: boolean): string {
  return html.replaceAll(albumTagPattern, (_tag, value: string) => {
    const id = parseAlbumReference(value);
    if (id === null) return showProblems ? albumProblem("That isn't a Spotify album link or ID.", value) : "";

    const lookup = lookups.get(id);
    if (lookup?.status === "unknown") return showProblems ? albumProblem("Spotify has no album with that ID.", value) : "";

    return albumCard(id, lookup);
  });
}
