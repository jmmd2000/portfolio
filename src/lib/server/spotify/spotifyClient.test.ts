import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSpotifyClient } from "./spotifyClient";

const album = {
  id: "7EJ0OT5ZqybXxcYRa6mccM",
  name: "For Emma, Forever Ago",
  release_date: "2008-02-19",
  artists: [{ name: "Bon Iver" }],
  images: [{ url: "https://i.scdn.co/image/300", width: 300, height: 300 }],
};

const playingTrack = {
  is_playing: true,
  currently_playing_type: "track",
  item: {
    name: "Holocene",
    external_urls: { spotify: "https://open.spotify.com/track/4fbvXwMTXPWaFyaMWUm9CR" },
    artists: [{ name: "Bon Iver" }],
    album: { images: [{ url: "https://i.scdn.co/image/300", width: 300, height: 300 }] },
  },
};

interface FakeSpotify {
  fetch: typeof fetch;
  tokenRequests: URLSearchParams[];
  playingRequests: string[];
  albumRequests: string[];
  /** What the next album requests get */
  albumResponse: () => Response;
  /** What the next currently-playing requests get */
  playingResponse: () => Response;
  /** What the next token requests get */
  tokenResponse: () => Response;
}

function fakeSpotify(): FakeSpotify {
  let tokenNumber = 0;
  const spotify: FakeSpotify = {
    tokenRequests: [],
    playingRequests: [],
    albumRequests: [],
    albumResponse: () => Response.json(album),
    playingResponse: () => Response.json(playingTrack),
    tokenResponse: () => {
      tokenNumber += 1;
      return Response.json({ access_token: `access-${tokenNumber}`, expires_in: 3600 });
    },
    fetch: async (input, init) => {
      const url = String(input);
      if (url.endsWith("/api/token")) {
        spotify.tokenRequests.push(new URLSearchParams(String(init?.body)));
        return spotify.tokenResponse();
      }
      if (url.includes("/v1/albums/")) {
        spotify.albumRequests.push(url);
        return spotify.albumResponse();
      }
      spotify.playingRequests.push(new Headers(init?.headers).get("authorization") ?? "");
      return spotify.playingResponse();
    },
  };
  return spotify;
}

function clientFor(spotify: FakeSpotify) {
  return createSpotifyClient({ clientID: "client", clientSecret: "secret", refreshToken: "refresh-1", fetch: spotify.fetch });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-22T12:00:00Z"));
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("getNowPlaying", () => {
  it("asks Spotify once per 30 seconds and shares the answer", async () => {
    const spotify = fakeSpotify();
    const client = clientFor(spotify);

    expect((await client.getNowPlaying())?.title).toBe("Holocene");
    vi.advanceTimersByTime(29_000);
    await client.getNowPlaying();
    expect(spotify.playingRequests).toHaveLength(1);

    vi.advanceTimersByTime(1_000);
    await client.getNowPlaying();
    expect(spotify.playingRequests).toHaveLength(2);
  });

  it("makes one request when visitors arrive together", async () => {
    const spotify = fakeSpotify();
    const client = clientFor(spotify);

    await Promise.all([client.getNowPlaying(), client.getNowPlaying(), client.getNowPlaying()]);

    expect(spotify.tokenRequests).toHaveLength(1);
    expect(spotify.playingRequests).toHaveLength(1);
  });

  it("keeps the access token until a minute before it expires", async () => {
    const spotify = fakeSpotify();
    const client = clientFor(spotify);

    await client.getNowPlaying();
    vi.advanceTimersByTime(58 * 60_000);
    await client.getNowPlaying();
    expect(spotify.tokenRequests).toHaveLength(1);

    vi.advanceTimersByTime(60_000);
    await client.getNowPlaying();
    expect(spotify.tokenRequests).toHaveLength(2);
    expect(spotify.playingRequests.at(-1)).toBe("Bearer access-2");
  });

  it("gives null for a failure, keeps it for 30 seconds, then asks again", async () => {
    const spotify = fakeSpotify();
    spotify.playingResponse = () => new Response("Too many requests", { status: 429 });
    const client = clientFor(spotify);

    expect(await client.getNowPlaying()).toBeNull();
    await client.getNowPlaying();
    expect(spotify.playingRequests).toHaveLength(1);

    spotify.playingResponse = () => Response.json(playingTrack);
    vi.advanceTimersByTime(30_000);
    expect((await client.getNowPlaying())?.title).toBe("Holocene");
  });

  it("drops an access token that Spotify rejects", async () => {
    const spotify = fakeSpotify();
    spotify.playingResponse = () => new Response(null, { status: 401 });
    const client = clientFor(spotify);

    expect(await client.getNowPlaying()).toBeNull();
    spotify.playingResponse = () => Response.json(playingTrack);
    vi.advanceTimersByTime(30_000);
    await client.getNowPlaying();

    expect(spotify.tokenRequests).toHaveLength(2);
    expect(spotify.playingRequests.at(-1)).toBe("Bearer access-2");
  });

  it("uses a new refresh token from Spotify for the next refresh", async () => {
    const spotify = fakeSpotify();
    spotify.tokenResponse = () => Response.json({ access_token: "access", expires_in: 3600, refresh_token: "refresh-2" });
    const client = clientFor(spotify);

    await client.getNowPlaying();
    vi.advanceTimersByTime(60 * 60_000);
    await client.getNowPlaying();

    expect(spotify.tokenRequests.map(request => request.get("refresh_token"))).toEqual(["refresh-1", "refresh-2"]);
  });
});

describe("getAlbum", () => {
  it("asks for the album by its ID and gives its details", async () => {
    const spotify = fakeSpotify();

    const found = await clientFor(spotify).getAlbum("7EJ0OT5ZqybXxcYRa6mccM");

    expect(spotify.albumRequests).toEqual(["https://api.spotify.com/v1/albums/7EJ0OT5ZqybXxcYRa6mccM"]);
    expect(found?.name).toBe("For Emma, Forever Ago");
  });

  it.each([400, 404])("gives null when Spotify answers %i, since it has no such album", async status => {
    const spotify = fakeSpotify();
    spotify.albumResponse = () => Response.json({ error: { status } }, { status });

    expect(await clientFor(spotify).getAlbum("7EJ0OT5ZqybXxcYRa6mccX")).toBeNull();
  });

  it("throws when Spotify fails", async () => {
    const spotify = fakeSpotify();
    spotify.albumResponse = () => new Response("Too many requests", { status: 429 });

    await expect(clientFor(spotify).getAlbum("7EJ0OT5ZqybXxcYRa6mccM")).rejects.toThrow("Spotify answered 429");
  });

  it("drops an access token that Spotify rejects", async () => {
    const spotify = fakeSpotify();
    spotify.albumResponse = () => new Response(null, { status: 401 });
    const client = clientFor(spotify);

    await expect(client.getAlbum("7EJ0OT5ZqybXxcYRa6mccM")).rejects.toThrow("rejected");
    spotify.albumResponse = () => Response.json(album);
    await client.getAlbum("7EJ0OT5ZqybXxcYRa6mccM");

    expect(spotify.tokenRequests).toHaveLength(2);
  });
});
