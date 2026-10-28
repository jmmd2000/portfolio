import { describe, expect, it } from "vitest";
import { parseNowPlaying } from "./nowPlaying";

function playingTrack(images = [640, 300, 64].map(width => ({ url: `https://i.scdn.co/image/${width}`, width, height: width }))) {
  return {
    is_playing: true,
    currently_playing_type: "track",
    item: {
      name: "Holocene",
      external_urls: { spotify: "https://open.spotify.com/track/4fbvXwMTXPWaFyaMWUm9CR" },
      artists: [{ name: "Bon Iver" }, { name: "Justin Vernon" }],
      album: { images },
    },
  };
}

describe("parseNowPlaying", () => {
  it("gives the track, every artist, the link and the cover closest to 300 pixels wide", () => {
    expect(parseNowPlaying(playingTrack())).toEqual({
      title: "Holocene",
      artists: "Bon Iver, Justin Vernon",
      coverURL: "https://i.scdn.co/image/300",
      url: "https://open.spotify.com/track/4fbvXwMTXPWaFyaMWUm9CR",
    });
  });

  it("falls back to the largest cover when none is 300 pixels wide, and to no cover when there are none", () => {
    expect(parseNowPlaying(playingTrack([{ url: "https://i.scdn.co/image/64", width: 64, height: 64 }]))?.coverURL).toBe("https://i.scdn.co/image/64");
    expect(parseNowPlaying(playingTrack([]))?.coverURL).toBeNull();
  });

  it("counts a paused track, a podcast or an advert as nothing playing", () => {
    expect(parseNowPlaying({ ...playingTrack(), is_playing: false })).toBeNull();
    expect(parseNowPlaying({ is_playing: true, currently_playing_type: "episode", item: null })).toBeNull();
    expect(parseNowPlaying({ is_playing: true, currently_playing_type: "ad", item: null })).toBeNull();
  });

  it("throws when a playing track has an unexpected shape", () => {
    expect(() => parseNowPlaying({ ...playingTrack(), item: { name: "Holocene" } })).toThrow();
    expect(() => parseNowPlaying("not json")).toThrow();
  });
});
