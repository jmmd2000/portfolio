import { z } from "zod";
import { coverRequestHeaders, coverRequestMilliseconds, joinSubtitle, maxCoverResults, type CoverResult } from "./coverResult";

const httpsURL = z.url({ protocol: /^https$/ });
const channelSchema = z.object({ name: z.string() }).nullable();

const showSearchSchema = z.array(
  z.object({
    show: z.object({
      name: z.string().min(1),
      premiered: z.string().nullable(),
      network: channelSchema,
      webChannel: channelSchema,
      image: z.object({ medium: httpsURL, original: httpsURL }).nullable(),
    }),
  })
);

/** The shows in a TVmaze search that have a poster, with their channel and the year they first aired */
export function parseTVmazeShows(body: unknown): CoverResult[] {
  const results: CoverResult[] = [];
  for (const { show } of showSearchSchema.parse(body)) {
    if (!show.image) continue;

    const channel = show.network?.name ?? show.webChannel?.name ?? null;
    const year = show.premiered?.slice(0, 4) ?? null;
    results.push({ title: show.name, subtitle: joinSubtitle(channel, year), thumbnailURL: show.image.medium, coverURL: show.image.original });
  }
  return results.slice(0, maxCoverResults);
}

/** Searches TVmaze for shows. Throws when TVmaze fails or answers in an unexpected shape */
export async function searchTVmazeShows(query: string, fetchFunction: typeof fetch = fetch): Promise<CoverResult[]> {
  const url = `https://api.tvmaze.com/search/shows?${new URLSearchParams({ q: query })}`;
  const response = await fetchFunction(url, { headers: coverRequestHeaders, signal: AbortSignal.timeout(coverRequestMilliseconds) });
  if (!response.ok) throw new Error(`TVmaze answered ${response.status}`);

  return parseTVmazeShows(await response.json());
}
