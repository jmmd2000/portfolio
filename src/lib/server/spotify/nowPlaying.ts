import { z } from "zod";

/** A track playing on Spotify, ready to show */
export interface NowPlaying {
  title: string;
  /** Every artist on the track, joined with commas */
  artists: string;
  coverURL: string | null;
  url: string;
}

const coverWidth = 300;

const currentlyPlayingSchema = z.object({
  is_playing: z.boolean(),
  currently_playing_type: z.string(),
  item: z.unknown(),
});

const imageSchema = z.object({
  url: z.url(),
  width: z.number().nullable(),
});

const trackSchema = z.object({
  name: z.string().min(1),
  external_urls: z.object({ spotify: z.url() }),
  artists: z.array(z.object({ name: z.string() })),
  album: z.object({ images: z.array(imageSchema) }),
});

type Image = z.infer<typeof imageSchema>;

/**
 * Turns Spotify's currently-playing answer into the track to show. Returns null when nothing is playing, or when
 * what's playing isn't a track, such as a podcast. Throws when the answer doesn't have the expected shape.
 */
export function parseNowPlaying(body: unknown): NowPlaying | null {
  const playing = currentlyPlayingSchema.parse(body);
  if (!playing.is_playing || playing.currently_playing_type !== "track") return null;

  const track = trackSchema.parse(playing.item);
  return {
    title: track.name,
    artists: track.artists.map(artist => artist.name).join(", "),
    coverURL: pickCover(track.album.images),
    url: track.external_urls.spotify,
  };
}

/** The smallest cover at least 300 pixels wide, or the largest there is */
function pickCover(images: Image[]): string | null {
  const byWidth = images.toSorted((first, second) => (first.width ?? 0) - (second.width ?? 0));
  const bigEnough = byWidth.find(image => (image.width ?? 0) >= coverWidth);
  const cover = bigEnough ?? byWidth.at(-1);
  return cover?.url ?? null;
}
