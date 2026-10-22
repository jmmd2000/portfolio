import { describe, expect, it } from "vitest";
import { irishHour, isNight, sleepState } from "./plumSleep";

describe("isNight", () => {
  it("runs from 23:00 up to 07:00 Irish time, in summer time", () => {
    // Irish summer time is an hour ahead of UTC
    expect(isNight(new Date("2026-07-01T21:59:00Z"))).toBe(false);
    expect(isNight(new Date("2026-07-01T22:00:00Z"))).toBe(true);
    expect(isNight(new Date("2026-07-02T05:59:00Z"))).toBe(true);
    expect(isNight(new Date("2026-07-02T06:00:00Z"))).toBe(false);
  });

  it("runs from 23:00 up to 07:00 Irish time, in winter time", () => {
    expect(isNight(new Date("2026-12-01T22:59:00Z"))).toBe(false);
    expect(isNight(new Date("2026-12-01T23:00:00Z"))).toBe(true);
    expect(isNight(new Date("2026-12-02T06:59:00Z"))).toBe(true);
    expect(isNight(new Date("2026-12-02T07:00:00Z"))).toBe(false);
  });
});

describe("irishHour", () => {
  it("gives midnight as 0, not 24", () => {
    expect(irishHour(new Date("2026-12-01T00:30:00Z"))).toBe(0);
  });
});

describe("sleepState", () => {
  const day = new Date("2026-12-01T12:00:00Z");
  const night = new Date("2026-12-01T23:30:00Z");

  it("has her awake by day with energy", () => {
    expect(sleepState(25, null, day)).toEqual({ sleep: null, wokenFrom: null });
  });

  it("has her napping by day below 25 energy, and asleep for the night whatever her energy", () => {
    expect(sleepState(24, null, day)).toEqual({ sleep: "nap", wokenFrom: null });
    expect(sleepState(100, null, night)).toEqual({ sleep: "night", wokenFrom: null });
  });

  it("keeps her awake while someone's woken her, and says what she was woken from", () => {
    const anHourLater = new Date(night.getTime() + 60 * 60 * 1000);
    expect(sleepState(100, anHourLater, night)).toEqual({ sleep: null, wokenFrom: "night" });
    expect(sleepState(10, new Date(day.getTime() + 1000), day)).toEqual({ sleep: null, wokenFrom: "nap" });
  });

  it("lets her fall asleep again once the hour is up", () => {
    expect(sleepState(100, night, night)).toEqual({ sleep: "night", wokenFrom: null });
  });
});
