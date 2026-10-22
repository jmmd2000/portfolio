import type { CurrentlyRow } from "$lib/server/content/currently";
import type { NowPlaying } from "$lib/server/spotify/nowPlaying";

/** A Currently row as the home page shows it. A live row shows what's playing on Spotify in place of what's saved */
export interface ShownCurrentlyRow extends CurrentlyRow {
  live: boolean;
}

/** The rows with Spotify's track in place of the chosen row. Without a track, every row shows what's saved for it */
export function withNowPlaying(rows: CurrentlyRow[], spotifyRowID: number | null, nowPlaying: NowPlaying | null): ShownCurrentlyRow[] {
  return rows.map(row => {
    if (nowPlaying === null || row.id !== spotifyRowID) return { ...row, live: false };

    return { ...row, label: "Listening now", title: nowPlaying.title, subtitle: nowPlaying.artists, imageURL: nowPlaying.coverURL, url: nowPlaying.url, live: true };
  });
}
