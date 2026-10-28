import { describe, expect, it } from "vitest";
import { timeSinceFed } from "./lastFed";

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

describe("timeSinceFed", () => {
  it("is just now for the first minute", () => {
    expect(timeSinceFed(0)).toEqual({ unit: "justNow" });
    expect(timeSinceFed(minute - 1)).toEqual({ unit: "justNow" });
  });

  it("counts whole minutes up to the hour", () => {
    expect(timeSinceFed(minute)).toEqual({ unit: "minutes", count: 1 });
    expect(timeSinceFed(hour - 1)).toEqual({ unit: "minutes", count: 59 });
  });

  it("counts whole hours up to a day", () => {
    expect(timeSinceFed(hour)).toEqual({ unit: "hours", count: 1 });
    expect(timeSinceFed(day - 1)).toEqual({ unit: "hours", count: 23 });
  });

  it("is yesterday from one day up to two", () => {
    expect(timeSinceFed(day)).toEqual({ unit: "yesterday" });
    expect(timeSinceFed(2 * day - 1)).toEqual({ unit: "yesterday" });
  });

  it("counts whole days from two days on", () => {
    expect(timeSinceFed(2 * day)).toEqual({ unit: "days", count: 2 });
    expect(timeSinceFed(10 * day + hour)).toEqual({ unit: "days", count: 10 });
  });
});
