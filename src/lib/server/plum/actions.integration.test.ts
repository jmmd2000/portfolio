import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { plum } from "$lib/server/db/schema";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { act, getPlumState } from "./actions";
import { getPlum } from "./plum";

// 10:00 in Ireland, when she's awake, and 00:30, when she's asleep for the night
const now = new Date("2026-10-22T09:00:00Z");
const night = new Date("2026-10-22T23:30:00Z");

function secondsLater(seconds: number): Date {
  return new Date(now.getTime() + seconds * 1000);
}

async function setPlum(stats: { food: number; happiness: number; energy: number }): Promise<void> {
  await db.insert(plum).values({ id: 1, ...stats, decayedAt: now });
}

async function getStats(): Promise<{ food: number; happiness: number; energy: number }> {
  const { food, happiness, energy } = await getPlum();
  return { food, happiness, energy };
}

/** Opens the pool's connections first. Otherwise each action waits for a new connection, and they run one by one */
async function openConnections(): Promise<void> {
  await Promise.all(Array.from({ length: 10 }, () => getPlum()));
}

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
});

describe("act", () => {
  it("feeds her and starts the feed cooldown only", async () => {
    await setPlum({ food: 30, happiness: 50, energy: 50 });

    const result = await act("feed", now);

    expect(result.outcome).toBe("done");
    expect(result.stats).toEqual({ food: 75, happiness: 50, energy: 50 });
    expect(result.cooldowns).toEqual({ feed: 25, pet: 0, play: 0 });
  });

  it("pets her and plays with her, keeping every stat between 0 and 100", async () => {
    await setPlum({ food: 50, happiness: 70, energy: 30 });

    await act("pet", now);
    const result = await act("play", now);

    expect(result.stats).toEqual({ food: 50, happiness: 100, energy: 10 });
  });

  it("refuses food when she's full, without using up the cooldown", async () => {
    await setPlum({ food: 90, happiness: 50, energy: 50 });

    const result = await act("feed", now);

    expect(result.outcome).toBe("full");
    expect(result.stats.food).toBe(90);
    expect(result.cooldowns.feed).toBe(0);
  });

  it("refuses food while she's asleep, without using up the cooldown", async () => {
    await setPlum({ food: 30, happiness: 50, energy: 100 });

    const result = await act("feed", night);

    expect(result.outcome).toBe("asleep");
    expect(result.sleep).toBe("night");
    expect(result.stats.food).toBe(30);
    expect(result.cooldowns.feed).toBe(0);
  });

  it("naps by day below 25 energy", async () => {
    await setPlum({ food: 30, happiness: 50, energy: 24 });

    const result = await act("feed", now);

    expect(result.outcome).toBe("asleep");
    expect(result.sleep).toBe("nap");
  });

  it("keeps her asleep when she's petted, and makes her happier", async () => {
    await setPlum({ food: 50, happiness: 50, energy: 100 });

    const result = await act("pet", night);

    expect(result.outcome).toBe("done");
    expect(result.sleep).toBe("night");
    expect(result.stats.happiness).toBe(65);
  });

  it("wakes her for an hour when someone plays with her while she's asleep", async () => {
    await setPlum({ food: 50, happiness: 50, energy: 100 });

    const result = await act("play", night);
    const fedDuringTheHour = await act("feed", new Date(night.getTime() + 59 * 60_000));
    const anHourLater = await getPlumState(new Date(night.getTime() + 60 * 60_000));

    expect(result.outcome).toBe("woke");
    expect(result).toMatchObject({ sleep: null, wokenFrom: "night" });
    expect(result.stats).toEqual({ food: 50, happiness: 75, energy: 80 });
    expect(fedDuringTheHour.outcome).toBe("done");
    expect(anHourLater).toMatchObject({ sleep: "night", wokenFrom: null });
  });

  it("turns down a second feed during the cooldown, and allows it once the cooldown is over", async () => {
    await setPlum({ food: 0, happiness: 50, energy: 50 });
    await act("feed", now);

    const tooSoon = await act("feed", secondsLater(24));
    const later = await act("feed", secondsLater(25));

    expect(tooSoon.outcome).toBe("cooling");
    expect(tooSoon.cooldowns.feed).toBe(1);
    expect(later.outcome).toBe("done");
    expect(later.stats.food).toBe(90);
  });

  it("feeds her once when several visitors feed her at the same moment", async () => {
    await setPlum({ food: 10, happiness: 50, energy: 50 });
    await openConnections();

    const results = await Promise.all(Array.from({ length: 10 }, () => act("feed", now)));

    expect(results.filter(result => result.outcome === "done")).toHaveLength(1);
    expect(results.filter(result => result.outcome === "cooling")).toHaveLength(9);
    expect((await getStats()).food).toBe(55);
  });

  it("applies different actions at the same moment together", async () => {
    await setPlum({ food: 10, happiness: 50, energy: 50 });
    await openConnections();

    await Promise.all([act("feed", now), act("pet", now), act("play", now)]);

    expect(await getStats()).toEqual({ food: 55, happiness: 90, energy: 30 });
  });
});

describe("getPlumState", () => {
  it("counts each cooldown down to 0", async () => {
    await setPlum({ food: 10, happiness: 50, energy: 50 });
    await act("feed", now);
    await act("pet", now);

    const state = await getPlumState(secondsLater(20));

    expect(state.cooldowns).toEqual({ feed: 5, pet: 0, play: 0 });
  });
});
