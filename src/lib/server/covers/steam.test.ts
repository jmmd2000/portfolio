import { describe, expect, it } from "vitest";
import { parseSteamGames, searchSteamGames } from "./steam";

function game(id: number, name: string, windows = true) {
  return { type: "app", id, name, tiny_image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/capsule_231x87.jpg`, platforms: { windows, mac: false, linux: false } };
}

describe("parseSteamGames", () => {
  it("keeps the Windows games, each with its library cover and no subtitle", () => {
    const games = parseSteamGames({ total: 2, items: [game(377160, "Fallout 4"), game(400, "Mac only", false)] });

    expect(games).toEqual([
      {
        title: "Fallout 4",
        subtitle: null,
        thumbnailURL: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900.jpg",
        coverURL: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/377160/library_600x900.jpg",
      },
    ]);
  });

  it("throws on an answer in an unexpected shape", () => {
    expect(() => parseSteamGames({ items: [{ id: "377160" }] })).toThrow();
  });
});

describe("searchSteamGames", () => {
  it("leaves out games with no library cover, and keeps at most five", async () => {
    const items = [game(1, "Fallout 4"), game(2, "Fallout 4 - Automatron"), ...[3, 4, 5, 6, 7].map(id => game(id, `Game ${id}`))];
    const fakeFetch = async (input: string | URL | Request): Promise<Response> => {
      const url = String(input);
      if (url.includes("storesearch")) return Response.json({ total: items.length, items });
      return new Response(null, { status: url.includes("/apps/2/") ? 404 : 200 });
    };

    const games = await searchSteamGames("Fallout 4", fakeFetch);

    expect(games.map(found => found.title)).toEqual(["Fallout 4", "Game 3", "Game 4", "Game 5", "Game 6"]);
  });
});
