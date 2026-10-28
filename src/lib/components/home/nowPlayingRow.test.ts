import { describe, expect, it } from "vitest";
import type { CurrentlyRow } from "$lib/server/content/currently";
import { withNowPlaying } from "./nowPlayingRow";

const nowPlaying = { title: "Holocene", artists: "Bon Iver", coverURL: null, url: "https://open.spotify.com/track/4fbvXwMTXPWaFyaMWUm9CR" };

function row(id: number, label: string): CurrentlyRow {
  return { id, label, title: `Saved ${id}`, subtitle: null, url: null, imageURL: null, shown: true, sort: id };
}

describe("withNowPlaying", () => {
  it("puts the track in the first row labelled Listening, whatever its case and spaces", () => {
    const rows = withNowPlaying([row(1, "Watching"), row(2, " listening "), row(3, "Listening")], nowPlaying);

    expect(rows.map(shown => [shown.title, shown.live])).toEqual([
      ["Saved 1", false],
      ["Holocene", true],
      ["Saved 3", false],
    ]);
  });

  it("leaves every row as saved when there's no Listening row", () => {
    const rows = withNowPlaying([row(1, "Watching"), row(2, "Listening to")], nowPlaying);

    expect(rows.every(shown => !shown.live && shown.title.startsWith("Saved"))).toBe(true);
  });
});
