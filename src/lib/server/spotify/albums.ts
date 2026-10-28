import { z } from "zod";
import { joinSubtitle, maxCoverResults, type CoverResult } from "$lib/server/covers/coverResult";

const httpsURL = z.url({ protocol: /^https$/ });

const albumSearchSchema = z.object({
  albums: z.object({
    items: z.array(
      z.object({
        name: z.string().min(1),
        release_date: z.string(),
        artists: z.array(z.object({ name: z.string() })),
        images: z.array(z.object({ url: httpsURL, width: z.number().nullable() })),
      })
    ),
  }),
});

/** The albums in a Spotify search that have a cover: the 300px cover as the thumbnail and the largest as the cover */
export function parseAlbums(body: unknown): CoverResult[] {
  const results: CoverResult[] = [];
  for (const album of albumSearchSchema.parse(body).albums.items) {
    const largestFirst = album.images.toSorted((first, second) => (second.width ?? 0) - (first.width ?? 0));
    const largest = largestFirst[0];
    if (!largest) continue;

    const thumbnail = largestFirst.findLast(image => (image.width ?? 0) >= 300) ?? largest;
    const artists = album.artists.map(artist => artist.name).join(", ");
    results.push({ title: album.name, subtitle: joinSubtitle(artists, album.release_date.slice(0, 4)), thumbnailURL: thumbnail.url, coverURL: largest.url });
  }
  return results.slice(0, maxCoverResults);
}
