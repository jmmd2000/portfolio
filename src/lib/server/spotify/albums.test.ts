import { describe, expect, it } from "vitest";
import { parseAlbum, parseAlbumReference, parseAlbums } from "./albums";

function images(...widths: number[]) {
  return widths.map(width => ({ url: `https://i.scdn.co/image/${width}`, width, height: width }));
}

describe("parseAlbums", () => {
  it("uses the 300px cover as the thumbnail and the largest as the cover, with every artist, the year and the page", () => {
    const [album] = parseAlbums({
      albums: {
        items: [
          {
            name: "Collab",
            external_urls: { spotify: "https://open.spotify.com/album/1" },
            release_date: "2011-06-21",
            artists: [{ name: "Bon Iver" }, { name: "Volcano Choir" }],
            images: images(64, 640, 300),
          },
        ],
      },
    });

    expect(album).toEqual({
      title: "Collab",
      subtitle: "Bon Iver, Volcano Choir · 2011",
      maker: "Bon Iver, Volcano Choir",
      pageURL: "https://open.spotify.com/album/1",
      thumbnailURL: "https://i.scdn.co/image/300",
      coverURL: "https://i.scdn.co/image/640",
    });
  });

  it("leaves out an album with no cover", () => {
    expect(parseAlbums({ albums: { items: [{ name: "Bare", release_date: "2011", artists: [], images: [] }] } })).toEqual([]);
  });
});

describe("parseAlbum", () => {
  const album = {
    id: "7EJ0OT5ZqybXxcYRa6mccM",
    name: "For Emma, Forever Ago",
    release_date: "2008-02-19",
    artists: [{ name: "Bon Iver" }],
    images: images(640, 300, 64),
  };

  it("keeps the name, every artist, the year and the 300px cover", () => {
    expect(parseAlbum(album)).toEqual({
      id: "7EJ0OT5ZqybXxcYRa6mccM",
      name: "For Emma, Forever Ago",
      artists: ["Bon Iver"],
      releaseYear: 2008,
      coverURL: "https://i.scdn.co/image/300",
    });
  });

  it("reads a release date that's only a year", () => {
    expect(parseAlbum({ ...album, release_date: "1981" }).releaseYear).toBe(1981);
  });

  it("gives no cover for an album without images", () => {
    expect(parseAlbum({ ...album, images: [] }).coverURL).toBeNull();
  });

  it("throws for an answer that isn't an album", () => {
    expect(() => parseAlbum({ error: { status: 500 } })).toThrow();
  });
});

describe("parseAlbumReference", () => {
  const id = "7EJ0OT5ZqybXxcYRa6mccM";

  it.each([
    ["a bare ID", id],
    ["an ID with spaces round it", `  ${id} `],
    ["a link", `https://open.spotify.com/album/${id}`],
    ["a share link", `https://open.spotify.com/album/${id}?si=8c1f2e0a9b6d4c37`],
    ["a link with a language part", `https://open.spotify.com/intl-de/album/${id}`],
    ["a link without https://", `open.spotify.com/album/${id}`],
  ])("reads the ID from %s", (_, value) => {
    expect(parseAlbumReference(value)).toBe(id);
  });

  it.each([
    ["an empty value", ""],
    ["the placeholder", "ID"],
    ["an ID that's one letter short", id.slice(1)],
    ["an ID with a symbol in it", `${id.slice(1)}-`],
    ["a track link", `https://open.spotify.com/track/${id}`],
    ["another site's link", `https://example.com/album/${id}`],
    ["a link with more after the ID", `https://open.spotify.com/album/${id}extra`],
  ])("gives null for %s", (_, value) => {
    expect(parseAlbumReference(value)).toBeNull();
  });
});
