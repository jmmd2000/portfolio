import { describe, expect, it } from "vitest";
import { moodLine, restingSprite, statWord } from "./plumMood";

const awake = { sleep: null, wokenFrom: null };

describe("statWord", () => {
  it("gives a word for each band of 20, from the bottom of each band", () => {
    expect(statWord(100)).toBe("Great");
    expect(statWord(80)).toBe("Great");
    expect(statWord(79)).toBe("Good");
    expect(statWord(60)).toBe("Good");
    expect(statWord(59)).toBe("Okay");
    expect(statWord(40)).toBe("Okay");
    expect(statWord(39)).toBe("Low");
    expect(statWord(20)).toBe("Low");
    expect(statWord(19)).toBe("Critical");
    expect(statWord(0)).toBe("Critical");
  });
});

describe("restingSprite", () => {
  it("shows her asleep whenever she's asleep, even when she's hungry", () => {
    expect(restingSprite({ stats: { food: 10, happiness: 50, energy: 100 }, sleep: "night" })).toBe("asleep");
  });

  it("shows her hungry below 40 food, and idle otherwise", () => {
    expect(restingSprite({ stats: { food: 39, happiness: 50, energy: 100 }, sleep: null })).toBe("hungry");
    expect(restingSprite({ stats: { food: 40, happiness: 50, energy: 100 }, sleep: null })).toBe("idle");
  });
});

describe("moodLine", () => {
  const stats = { food: 10, happiness: 90, energy: 10 };

  it("puts sleep first, then being woken, then hunger, then happiness", () => {
    expect(moodLine({ stats, sleep: "night", wokenFrom: null })).toBe("She's asleep for the night");
    expect(moodLine({ stats, sleep: "nap", wokenFrom: null })).toBe("She's having a nap");
    expect(moodLine({ stats, sleep: null, wokenFrom: "night" })).toBe("She's up past her bedtime");
    expect(moodLine({ stats, sleep: null, wokenFrom: "nap" })).toBe("She's awake, just about");
    expect(moodLine({ stats: { food: 39, happiness: 90, energy: 50 }, ...awake })).toBe("She's getting hungry");
    expect(moodLine({ stats: { food: 40, happiness: 80, energy: 50 }, ...awake })).toBe("She's very happy");
    expect(moodLine({ stats: { food: 40, happiness: 79, energy: 50 }, ...awake })).toBe("She's content");
  });
});
