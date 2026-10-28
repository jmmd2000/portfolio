import type { CoverSource } from "$lib/schemas/coverSearch";
import { spotify } from "$lib/server/spotify";
import type { CoverResult } from "./coverResult";
import { searchOpenLibraryBooks } from "./openLibrary";
import { searchSteamGames } from "./steam";
import { searchTVmazeShows } from "./tvmaze";

/** Searches one source for covers. Throws when the source fails or answers in an unexpected shape */
export function searchCovers(source: CoverSource, query: string): Promise<CoverResult[]> {
  switch (source) {
    case "album":
      return spotify.searchAlbums(query);
    case "game":
      return searchSteamGames(query);
    case "show":
      return searchTVmazeShows(query);
    case "book":
      return searchOpenLibraryBooks(query);
  }
}
