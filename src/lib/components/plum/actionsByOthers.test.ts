import { describe, expect, it } from "vitest";
import { actionsByOthers } from "./actionsByOthers";

const ready = { feed: 0, pet: 0, play: 0 };

describe("actionsByOthers", () => {
  it("spots a cooldown that started since the last check", () => {
    expect(actionsByOthers(ready, { feed: 18, pet: 0, play: 0 })).toEqual(["feed"]);
  });

  it("leaves out a cooldown the page already knew about as it counts down", () => {
    expect(actionsByOthers({ feed: 20, pet: 0, play: 0 }, { feed: 19, pet: 0, play: 0 })).toEqual([]);
  });

  it("allows a second of difference between the page's clock and the server's", () => {
    expect(actionsByOthers({ feed: 10, pet: 0, play: 0 }, { feed: 11, pet: 0, play: 0 })).toEqual([]);
  });

  it("leaves out an action from more than 11 seconds ago, such as while the tab was in the background", () => {
    expect(actionsByOthers(ready, { feed: 14, pet: 0, play: 0 })).toEqual(["feed"]);
    expect(actionsByOthers(ready, { feed: 13, pet: 0, play: 0 })).toEqual([]);
  });

  it("spots several actions at once", () => {
    expect(actionsByOthers(ready, { feed: 20, pet: 10, play: 30 })).toEqual(["feed", "pet", "play"]);
  });
});
