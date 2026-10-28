import { describe, expect, it } from "vitest";
import { parseTVmazeShows } from "./tvmaze";

const poster = { medium: "https://static.tvmaze.com/uploads/images/medium_portrait/501/1253519.jpg", original: "https://static.tvmaze.com/uploads/images/original_untouched/501/1253519.jpg" };

function show(name: string, details: Record<string, unknown>) {
  return { score: 0.9, show: { name, url: "https://www.tvmaze.com/shows/169/breaking-bad", premiered: null, network: null, webChannel: null, image: poster, ...details } };
}

describe("parseTVmazeShows", () => {
  it("gives the medium poster as the thumbnail and the original as the cover, with the channel, first year and page", () => {
    const [breakingBad] = parseTVmazeShows([show("Breaking Bad", { premiered: "2008-01-20", network: { name: "AMC" } })]);

    expect(breakingBad).toEqual({
      title: "Breaking Bad",
      subtitle: "AMC · 2008",
      maker: "AMC",
      pageURL: "https://www.tvmaze.com/shows/169/breaking-bad",
      thumbnailURL: poster.medium,
      coverURL: poster.original,
    });
  });

  it("uses the streaming service when there's no TV channel, and leaves out what's unknown", () => {
    const shows = parseTVmazeShows([show("Online", { webChannel: { name: "Netflix" } }), show("Unknown", {})]);

    expect(shows.map(found => found.subtitle)).toEqual(["Netflix", null]);
    expect(shows.map(found => found.maker)).toEqual(["Netflix", null]);
  });

  it("leaves out shows with no poster", () => {
    expect(parseTVmazeShows([show("No poster", { image: null })])).toEqual([]);
  });

  it("refuses a poster that isn't https", () => {
    expect(() => parseTVmazeShows([show("Unsafe", { image: { medium: "http://example.com/a.jpg", original: "http://example.com/b.jpg" } })])).toThrow();
  });
});
