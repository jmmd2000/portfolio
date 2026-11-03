import { z } from "zod";
import { joinSubtitle, maxCoverResults, type CoverResult } from "$lib/server/covers/coverResult";

const httpsURL = z.url({ protocol: /^https$/ });

const imageSchema = z.object({ url: httpsURL, width: z.number().nullable() });

type SpotifyImage = z.infer<typeof imageSchema>;

const albumSearchSchema = z.object({
  albums: z.object({
    items: z.array(
      z.object({
        name: z.string().min(1),
        external_urls: z.object({ spotify: httpsURL }).optional(),
        release_date: z.string(),
        artists: z.array(z.object({ name: z.string() })),
        images: z.array(imageSchema),
      })
    ),
  }),
});

const albumSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  release_date: z.string().regex(/^\d{4}/),
  artists: z.array(z.object({ name: z.string() })),
  images: z.array(imageSchema),
});

/** An album's details from Spotify, as an article's album card shows them */
export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: string[];
  releaseYear: number;
  /** The 300px cover, or null when the album has none */
  coverURL: string | null;
}

const albumIDPattern = /^[0-9A-Za-z]{22}$/;
const albumLinkPattern = /^(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z-]+\/)?album\/([0-9A-Za-z]{22})(?:[/?#].*)?$/;

/** The largest image, and the smallest one that's at least 300px wide. Null when there are no images */
function pickCovers(images: SpotifyImage[]): { largest: SpotifyImage; thumbnail: SpotifyImage } | null {
  const largestFirst = images.toSorted((first, second) => (second.width ?? 0) - (first.width ?? 0));
  const largest = largestFirst[0];
  if (!largest) return null;

  const thumbnail = largestFirst.findLast(image => (image.width ?? 0) >= 300) ?? largest;
  return { largest, thumbnail };
}

/** The albums in a Spotify search that have a cover: the 300px cover as the thumbnail, the largest as the cover, and the album's Spotify page */
export function parseAlbums(body: unknown): CoverResult[] {
  const results: CoverResult[] = [];
  for (const album of albumSearchSchema.parse(body).albums.items) {
    const covers = pickCovers(album.images);
    if (!covers) continue;

    const artists = album.artists.map(artist => artist.name).join(", ");
    results.push({
      title: album.name,
      subtitle: joinSubtitle(artists, album.release_date.slice(0, 4)),
      maker: artists || null,
      pageURL: album.external_urls?.spotify ?? null,
      thumbnailURL: covers.thumbnail.url,
      coverURL: covers.largest.url,
    });
  }
  return results.slice(0, maxCoverResults);
}

/** One album from Spotify's album endpoint. Throws when the answer isn't an album */
export function parseAlbum(body: unknown): SpotifyAlbum {
  const album = albumSchema.parse(body);
  return {
    id: album.id,
    name: album.name,
    artists: album.artists.map(artist => artist.name),
    releaseYear: Number(album.release_date.slice(0, 4)),
    coverURL: pickCovers(album.images)?.thumbnail.url ?? null,
  };
}

/**
 * The album ID in an album tag's value, which can be the ID itself or a Spotify album link. Anything after the ID
 * in a link, such as a share code, is ignored. Null when the value is neither.
 */
export function parseAlbumReference(value: string): string | null {
  const trimmed = value.trim();
  if (albumIDPattern.test(trimmed)) return trimmed;

  return albumLinkPattern.exec(trimmed)?.[1] ?? null;
}
