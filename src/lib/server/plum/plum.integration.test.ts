import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { plum } from "$lib/server/db/schema";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { decayPlum, getPlum } from "./plum";

const decayedAt = new Date("2026-10-22T09:00:00Z");

function minutesLater(minutes: number): Date {
  return new Date(decayedAt.getTime() + minutes * 60_000);
}

async function setPlum(stats: { food: number; happiness: number; energy: number }): Promise<void> {
  await db.insert(plum).values({ id: 1, ...stats, decayedAt });
}

async function getStats(): Promise<{ food: number; happiness: number; energy: number }> {
  const { food, happiness, energy } = await getPlum();
  return { food, happiness, energy };
}

async function getDecayedAt(): Promise<Date> {
  const [row] = await db.select({ decayedAt: plum.decayedAt }).from(plum);
  if (!row) throw new Error("Plum's row is missing");
  return row.decayedAt;
}

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
});

describe("getPlum", () => {
  it("gives her starting stats the first time, with nobody keeping her awake or having fed her", async () => {
    expect(await getPlum()).toEqual({ food: 80, happiness: 80, energy: 100, awakeUntil: null, lastFedAt: null });
  });
});

describe("decayPlum", () => {
  it("applies one step for each whole 15 minutes and keeps the rest of the time for the next step", async () => {
    await setPlum({ food: 50, happiness: 50, energy: 50 });

    await decayPlum(minutesLater(47));

    expect(await getStats()).toEqual({ food: 44, happiness: 47, energy: 65 });
    expect(await getDecayedAt()).toEqual(minutesLater(45));
  });

  it("changes nothing before 15 minutes have passed", async () => {
    await setPlum({ food: 50, happiness: 50, energy: 50 });

    await decayPlum(minutesLater(14));

    expect(await getStats()).toEqual({ food: 50, happiness: 50, energy: 50 });
    expect(await getDecayedAt()).toEqual(decayedAt);
  });

  it("brings her energy back twice as fast at night", async () => {
    // Midnight in Ireland, which is an hour ahead of UTC in October
    const midnight = new Date("2026-10-22T23:00:00Z");
    await db.insert(plum).values({ id: 1, food: 50, happiness: 50, energy: 50, decayedAt: midnight });

    await decayPlum(new Date(midnight.getTime() + 30 * 60_000));

    expect(await getStats()).toEqual({ food: 46, happiness: 48, energy: 70 });
  });

  it("keeps every stat between 0 and 100", async () => {
    await setPlum({ food: 3, happiness: 1, energy: 98 });

    await decayPlum(minutesLater(60));

    expect(await getStats()).toEqual({ food: 0, happiness: 0, energy: 100 });
  });

  it("applies the steps once when decays run at the same moment", async () => {
    await setPlum({ food: 50, happiness: 50, energy: 50 });
    // Opens the pool's connections first. Otherwise each decay waits for a new connection, and they run one by one
    await Promise.all(Array.from({ length: 10 }, () => getPlum()));

    await Promise.all(Array.from({ length: 10 }, () => decayPlum(minutesLater(30))));

    expect(await getStats()).toEqual({ food: 46, happiness: 48, energy: 60 });
  });
});
