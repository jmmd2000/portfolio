import type { CurrentlyRow } from "$lib/server/content/currently";
import type { NowPlaying } from "$lib/server/spotify/nowPlaying";

/** A Currently row as the home page shows it. A live row shows what's playing on Spotify in place of what's saved */
export interface ShownCurrentlyRow extends CurrentlyRow {
  live: boolean;
}

/** Whether Spotify can replace this row: it's labelled Listening, ignoring case and spaces */
export function isListeningRow(row: CurrentlyRow): boolean {
  return row.label.trim().toLowerCase() === "listening";
}

/** The rows with Spotify's track in place of the first Listening row. Without a track, every row shows what's saved for it */
export function withNowPlaying(rows: CurrentlyRow[], nowPlaying: NowPlaying | null): ShownCurrentlyRow[] {
  if (nowPlaying === null) return rows.map(row => ({ ...row, live: false }));

  const listeningRowIndex = rows.findIndex(isListeningRow);
  return rows.map((row, index) => {
    if (index !== listeningRowIndex) return { ...row, live: false };

    return { ...row, label: "Listening now", title: nowPlaying.title, subtitle: nowPlaying.artists, imageURL: nowPlaying.coverURL, url: nowPlaying.url, live: true };
  });
}
