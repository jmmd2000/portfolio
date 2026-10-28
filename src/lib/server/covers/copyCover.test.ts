import { describe, expect, it } from "vitest";
import { downloadCover, isCoverHost, RefusedCover } from "./copyCover";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

/** A fetch that answers each address from `answers`, and records every address it was asked for */
function fakeFetch(answers: Record<string, () => Response>) {
  const asked: string[] = [];
  const fetchFunction = async (input: string | URL | Request): Promise<Response> => {
    const url = String(input);
    asked.push(url);
    const answer = answers[url];
    return answer ? answer() : new Response(null, { status: 404 });
  };
  return { fetchFunction, asked };
}

function redirectTo(location: string): () => Response {
  return () => new Response(null, { status: 302, headers: { location } });
}

describe("isCoverHost", () => {
  it("allows the sources' cover hosts and archive.org's file servers, over https only", () => {
    expect(isCoverHost(new URL("https://i.scdn.co/image/ab67"))).toBe(true);
    expect(isCoverHost(new URL("https://ia801601.us.archive.org/view_archive.php"))).toBe(true);
    expect(isCoverHost(new URL("http://static.tvmaze.com/poster.jpg"))).toBe(false);
    expect(isCoverHost(new URL("https://static.tvmaze.com:8443/poster.jpg"))).toBe(false);
  });

  it("refuses a host that only looks like one of them", () => {
    expect(isCoverHost(new URL("https://evilarchive.org/cover.jpg"))).toBe(false);
    expect(isCoverHost(new URL("https://i.scdn.co.example.com/cover.jpg"))).toBe(false);
  });
});

describe("downloadCover", () => {
  it("follows Open Library's redirect to archive.org and returns the image", async () => {
    const { fetchFunction } = fakeFetch({
      "https://covers.openlibrary.org/b/id/1-L.jpg": redirectTo("https://archive.org/download/covers/1-L.jpg"),
      "https://archive.org/download/covers/1-L.jpg": redirectTo("https://ia801601.us.archive.org/covers/1-L.jpg"),
      "https://ia801601.us.archive.org/covers/1-L.jpg": () => new Response(jpeg),
    });

    const cover = await downloadCover("https://covers.openlibrary.org/b/id/1-L.jpg", fetchFunction);

    expect(cover.type.contentType).toBe("image/jpeg");
  });

  it("refuses a redirect to any other host, without fetching it", async () => {
    const { fetchFunction, asked } = fakeFetch({ "https://static.tvmaze.com/poster.jpg": redirectTo("http://169.254.169.254/latest/meta-data") });

    await expect(downloadCover("https://static.tvmaze.com/poster.jpg", fetchFunction)).rejects.toThrow(RefusedCover);
    expect(asked).toEqual(["https://static.tvmaze.com/poster.jpg"]);
  });

  it("refuses an address on any other host, without fetching it", async () => {
    const { fetchFunction, asked } = fakeFetch({});

    await expect(downloadCover("https://example.com/cover.jpg", fetchFunction)).rejects.toThrow(RefusedCover);
    expect(asked).toEqual([]);
  });

  it("gives up after three redirects", async () => {
    const { fetchFunction } = fakeFetch({
      "https://archive.org/a": redirectTo("https://archive.org/b"),
      "https://archive.org/b": redirectTo("https://archive.org/c"),
      "https://archive.org/c": redirectTo("https://archive.org/d"),
      "https://archive.org/d": redirectTo("https://archive.org/e"),
      "https://archive.org/e": () => new Response(jpeg),
    });

    await expect(downloadCover("https://archive.org/a", fetchFunction)).rejects.toThrow(RefusedCover);
  });

  it("refuses an SVG, which no source serves as a cover", async () => {
    const { fetchFunction } = fakeFetch({ "https://i.scdn.co/image/1": () => new Response(svg) });

    await expect(downloadCover("https://i.scdn.co/image/1", fetchFunction)).rejects.toThrow(RefusedCover);
  });
});
