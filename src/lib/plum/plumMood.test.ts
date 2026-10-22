import { describe, expect, it } from "vitest";
import { moodLine, restingSprite, statWord } from "./plumMood";

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
  it("shows her asleep below 25 energy, even when she's hungry", () => {
    expect(restingSprite({ food: 10, happiness: 50, energy: 24 })).toBe("asleep");
  });

  it("shows her hungry below 40 food", () => {
    expect(restingSprite({ food: 39, happiness: 50, energy: 25 })).toBe("hungry");
  });

  it("shows her idle otherwise", () => {
    expect(restingSprite({ food: 40, happiness: 50, energy: 25 })).toBe("idle");
  });
});

describe("moodLine", () => {
  it("puts sleep first, then hunger, then happiness", () => {
    expect(moodLine({ food: 10, happiness: 90, energy: 10 })).toBe("She's asleep");
    expect(moodLine({ food: 39, happiness: 90, energy: 50 })).toBe("She's getting hungry");
    expect(moodLine({ food: 40, happiness: 80, energy: 50 })).toBe("She's very happy");
    expect(moodLine({ food: 40, happiness: 79, energy: 50 })).toBe("She's content");
  });
});
