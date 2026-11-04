import { inArray } from "drizzle-orm";
import { db } from "$lib/server/db";
import { spotifyAlbums } from "$lib/server/db/schema";
import { spotify } from "$lib/server/spotify";
import type { AlbumLookup, SpotifyAlbum } from "$lib/server/spotify/albums";

type GetAlbum = (id: string) => Promise<SpotifyAlbum | null>;

async function getSavedAlbums(ids: string[]): Promise<SpotifyAlbum[]> {
  return db
    .select({
      id: spotifyAlbums.id,
      name: spotifyAlbums.name,
      artists: spotifyAlbums.artists,
      releaseYear: spotifyAlbums.releaseYear,
      coverURL: spotifyAlbums.coverURL,
    })
    .from(spotifyAlbums)
    .where(inArray(spotifyAlbums.id, ids));
}

/** Two visitors can both fetch a new album at once, so a save that finds the album already there does nothing */
async function saveAlbum(album: SpotifyAlbum): Promise<void> {
  await db.insert(spotifyAlbums).values(album).onConflictDoNothing();
}

async function fetchAlbum(id: string, getAlbum: GetAlbum): Promise<AlbumLookup> {
  let album: SpotifyAlbum | null;
  try {
    album = await getAlbum(id);
  } catch (error) {
    console.error(`Couldn't get album ${id} from Spotify:`, error);
    return { status: "unreachable" };
  }

  if (!album) return { status: "unknown" };
  await saveAlbum(album);
  return { status: "found", album };
}

/**
 * Finds albums by their Spotify IDs. Saved albums come from the database. The rest are fetched from Spotify and saved,
 * so Spotify is only asked about an album until it's found. Nothing is saved for an album that Spotify doesn't know or
 * can't answer about, so the next call asks again. Tests pass a fake `getAlbum`.
 */
export async function lookUpAlbums(ids: string[], getAlbum: GetAlbum = id => spotify.getAlbum(id)): Promise<Map<string, AlbumLookup>> {
  if (ids.length === 0) return new Map();

  const uniqueIDs = [...new Set(ids)];
  const lookups = new Map<string, AlbumLookup>();
  for (const album of await getSavedAlbums(uniqueIDs)) {
    lookups.set(album.id, { status: "found", album });
  }

  const missingIDs = uniqueIDs.filter(id => !lookups.has(id));
  const fetched = await Promise.all(missingIDs.map(id => fetchAlbum(id, getAlbum)));
  missingIDs.forEach((id, index) => lookups.set(id, fetched[index]));

  return lookups;
}
