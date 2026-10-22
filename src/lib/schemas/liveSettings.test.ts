import { describe, expect, it } from "vitest";
import { liveSettingsSchema } from "./liveSettings";

describe("liveSettingsSchema", () => {
  it("reads None as no Spotify row, and a row's id as a number", () => {
    expect(liveSettingsSchema.parse({ spotifyRowID: "" }).spotifyRowID).toBeNull();
    expect(liveSettingsSchema.parse({ spotifyRowID: "7" }).spotifyRowID).toBe(7);
  });

  it("refuses a Spotify row that isn't a row's id", () => {
    expect(liveSettingsSchema.safeParse({ spotifyRowID: "0" }).success).toBe(false);
    expect(liveSettingsSchema.safeParse({ spotifyRowID: "first" }).success).toBe(false);
    expect(liveSettingsSchema.safeParse({}).success).toBe(false);
  });
});
