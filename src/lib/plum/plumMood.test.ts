import { describe, expect, it } from "vitest";
import { moodLine, restingSprite, statWord } from "./plumMood";

const awake = { sleep: null, wokenFrom: null };

describe("statWord", () => {
  it("gives a new word at the bottom of each band of 20", () => {
    for (const bottom of [20, 40, 60, 80]) {
      expect(statWord(bottom - 1)).not.toBe(statWord(bottom));
      expect(statWord(bottom + 19)).toBe(statWord(bottom));
    }
    expect(statWord(0)).toBe(statWord(19));
    expect(statWord(100)).toBe(statWord(80));
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
  const hungry = { food: 39, happiness: 90, energy: 50 };
  const happy = { food: 40, happiness: 80, energy: 50 };
  const content = { food: 40, happiness: 79, energy: 50 };

  it("puts sleep first, then being woken, then hunger, then happiness", () => {
    expect(moodLine({ stats: hungry, sleep: "night", wokenFrom: null })).toBe(moodLine({ stats: happy, sleep: "night", wokenFrom: null }));
    expect(moodLine({ stats: hungry, sleep: null, wokenFrom: "nap" })).toBe(moodLine({ stats: happy, sleep: null, wokenFrom: "nap" }));
    expect(moodLine({ stats: hungry, ...awake })).not.toBe(moodLine({ stats: happy, ...awake }));
    expect(moodLine({ stats: happy, ...awake })).not.toBe(moodLine({ stats: content, ...awake }));
  });

  it("gives each kind of sleep and waking its own line", () => {
    const lines = [
      moodLine({ stats: happy, sleep: "night", wokenFrom: null }),
      moodLine({ stats: happy, sleep: "nap", wokenFrom: null }),
      moodLine({ stats: happy, sleep: null, wokenFrom: "night" }),
      moodLine({ stats: happy, sleep: null, wokenFrom: "nap" }),
    ];

    expect(new Set(lines).size).toBe(4);
  });
});
