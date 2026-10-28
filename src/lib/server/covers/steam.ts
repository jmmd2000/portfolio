import { z } from "zod";
import { coverRequestHeaders, coverRequestMilliseconds, maxCoverResults, type CoverResult } from "./coverResult";

const storeSearchSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      platforms: z.object({ windows: z.boolean() }),
    })
  ),
});

/** The tall cover Steam shows in a player's library. Older games and add-ons often don't have one */
function libraryCoverURL(appID: number): string {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appID}/library_600x900.jpg`;
}

/** The Windows games in a Steam store search, each with its library cover. Steam's search doesn't say who made a game */
export function parseSteamGames(body: unknown): CoverResult[] {
  return storeSearchSchema
    .parse(body)
    .items.filter(item => item.platforms.windows)
    .map(item => ({
      title: item.name,
      subtitle: null,
      maker: null,
      pageURL: `https://store.steampowered.com/app/${item.id}/`,
      thumbnailURL: libraryCoverURL(item.id),
      coverURL: libraryCoverURL(item.id),
    }));
}

/**
 * Searches the Steam store for PC games. A game whose library cover doesn't exist is left out, which also drops
 * most add-ons, since they have none. Throws when Steam fails or answers in an unexpected shape.
 */
export async function searchSteamGames(query: string, fetchFunction: typeof fetch = fetch): Promise<CoverResult[]> {
  const url = `https://store.steampowered.com/api/storesearch/?${new URLSearchParams({ term: query, l: "english", cc: "IE" })}`;
  const response = await fetchFunction(url, { headers: coverRequestHeaders, signal: AbortSignal.timeout(coverRequestMilliseconds) });
  if (!response.ok) throw new Error(`Steam answered ${response.status}`);

  const games = parseSteamGames(await response.json());
  const coverChecks = await Promise.all(games.map(game => hasCover(game.coverURL, fetchFunction)));
  return games.filter((_game, index) => coverChecks[index]).slice(0, maxCoverResults);
}

async function hasCover(url: string, fetchFunction: typeof fetch): Promise<boolean> {
  try {
    const response = await fetchFunction(url, { method: "HEAD", headers: coverRequestHeaders, signal: AbortSignal.timeout(coverRequestMilliseconds) });
    return response.ok;
  } catch {
    return false;
  }
}
