import { describe, expect, it } from "vitest";
import { parseAlbums } from "./albums";

function images(...widths: number[]) {
  return widths.map(width => ({ url: `https://i.scdn.co/image/${width}`, width, height: width }));
}

describe("parseAlbums", () => {
  it("uses the 300px cover as the thumbnail and the largest as the cover, with every artist and the year", () => {
    const [album] = parseAlbums({ albums: { items: [{ name: "Collab", release_date: "2011-06-21", artists: [{ name: "Bon Iver" }, { name: "Volcano Choir" }], images: images(64, 640, 300) }] } });

    expect(album).toEqual({ title: "Collab", subtitle: "Bon Iver, Volcano Choir · 2011", thumbnailURL: "https://i.scdn.co/image/300", coverURL: "https://i.scdn.co/image/640" });
  });

  it("leaves out an album with no cover", () => {
    expect(parseAlbums({ albums: { items: [{ name: "Bare", release_date: "2011", artists: [], images: [] }] } })).toEqual([]);
  });
});
