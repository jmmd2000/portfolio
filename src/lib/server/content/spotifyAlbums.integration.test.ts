import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "$lib/server/db";
import { spotifyAlbums } from "$lib/server/db/schema";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import type { SpotifyAlbum } from "$lib/server/spotify/albums";
import { lookUpAlbums } from "./spotifyAlbums";

const album: SpotifyAlbum = {
  id: "7EJ0OT5ZqybXxcYRa6mccM",
  name: "For Emma, Forever Ago",
  artists: ["Bon Iver"],
  releaseYear: 2008,
  coverURL: "https://i.scdn.co/image/300",
};

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
});

describe("lookUpAlbums", () => {
  it("fetches a new album once, and uses the saved copy after that", async () => {
    const getAlbum = vi.fn(async () => album);

    const first = await lookUpAlbums([album.id], getAlbum);
    const second = await lookUpAlbums([album.id], getAlbum);

    expect(first.get(album.id)).toEqual({ status: "found", album });
    expect(second.get(album.id)).toEqual({ status: "found", album });
    expect(getAlbum).toHaveBeenCalledTimes(1);
  });

  it("asks once for an album that appears twice", async () => {
    const getAlbum = vi.fn(async () => album);

    await lookUpAlbums([album.id, album.id], getAlbum);

    expect(getAlbum).toHaveBeenCalledTimes(1);
  });

  it("copes with two first views of an album at the same time", async () => {
    // Neither answer comes until both views are waiting on Spotify, so both go on to save the album
    const { promise: bothAsked, resolve: answer } = Promise.withResolvers<void>();
    let requests = 0;
    const getAlbum = vi.fn(async () => {
      requests += 1;
      if (requests === 2) answer();
      await bothAsked;
      return album;
    });

    await Promise.all([lookUpAlbums([album.id], getAlbum), lookUpAlbums([album.id], getAlbum)]);

    expect(getAlbum).toHaveBeenCalledTimes(2);
    expect(await db.select().from(spotifyAlbums)).toHaveLength(1);
  });

  it("saves nothing for an album Spotify doesn't know, and asks again next time", async () => {
    const getAlbum = vi.fn(async () => null);

    const lookups = await lookUpAlbums([album.id], getAlbum);
    await lookUpAlbums([album.id], getAlbum);

    expect(lookups.get(album.id)).toEqual({ status: "unknown" });
    expect(getAlbum).toHaveBeenCalledTimes(2);
    expect(await db.select().from(spotifyAlbums)).toEqual([]);
  });

  it("saves nothing when Spotify fails, and the next look-up can still find the album", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const getAlbum = vi.fn<() => Promise<SpotifyAlbum>>().mockRejectedValueOnce(new Error("Spotify answered 503")).mockResolvedValueOnce(album);

    const failed = await lookUpAlbums([album.id], getAlbum);
    const found = await lookUpAlbums([album.id], getAlbum);

    expect(failed.get(album.id)).toEqual({ status: "unreachable" });
    expect(found.get(album.id)).toEqual({ status: "found", album });
  });

  it("gives every album its own answer when only some can be found", async () => {
    const otherID = "4bJCKmpKgti10f3ltz6LLl";
    const getAlbum = vi.fn(async (id: string) => (id === album.id ? album : null));

    const lookups = await lookUpAlbums([album.id, otherID], getAlbum);

    expect(lookups.get(album.id)?.status).toBe("found");
    expect(lookups.get(otherID)?.status).toBe("unknown");
  });

  it("does nothing when there are no albums", async () => {
    const getAlbum = vi.fn(async () => album);

    expect(await lookUpAlbums([], getAlbum)).toEqual(new Map());
    expect(getAlbum).not.toHaveBeenCalled();
  });
});
