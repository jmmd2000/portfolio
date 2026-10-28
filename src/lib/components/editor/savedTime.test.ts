import { describe, expect, it } from "vitest";
import { savedTimeLabel } from "./savedTime";

describe("savedTimeLabel", () => {
  it("gives only the time for a save earlier the same day", () => {
    const label = savedTimeLabel(new Date("2026-10-21T13:02:00Z"), new Date("2026-10-21T18:00:00Z"));

    expect(label).toContain("14:02");
    expect(label).not.toContain("October");
  });

  it("gives the day too for a save on an earlier day", () => {
    const label = savedTimeLabel(new Date("2026-10-03T13:02:00Z"), new Date("2026-10-21T18:00:00Z"));

    expect(label).toContain("3 October 2026");
    expect(label).toContain("14:02");
  });

  it("counts days in Irish time, not UTC", () => {
    // 23:30 UTC in summer is 00:30 the next day in Ireland, the same day as the later time
    const label = savedTimeLabel(new Date("2026-07-01T23:30:00Z"), new Date("2026-07-02T09:00:00Z"));

    expect(label).toContain("00:30");
    expect(label).not.toContain("July");
  });
});
