import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { plum } from "$lib/server/db/schema";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { getPlumState } from "./actions";
import { addThrow } from "./throws";

// 10:00 in Ireland, when she's awake, and 00:30, when she's asleep for the night
const now = new Date("2026-10-22T09:00:00Z");
const night = new Date("2026-10-22T23:30:00Z");

async function setPlum(stats: { food: number; happiness: number; energy: number }): Promise<void> {
  await db.insert(plum).values({ id: 1, ...stats, decayedAt: now });
}

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
});

describe("addThrow", () => {
  it("counts each throw, and each one takes 1 energy and adds 1 happiness, kept between 0 and 100", async () => {
    await setPlum({ food: 50, happiness: 99, energy: 1 });

    const first = await addThrow(now);
    const second = await addThrow(now);
    const state = await getPlumState(now);

    expect([first, second]).toEqual([1, 2]);
    expect(state.stats).toEqual({ food: 50, happiness: 100, energy: 0 });
  });

  it("wakes her for an hour when the ball is thrown while she's asleep", async () => {
    await setPlum({ food: 50, happiness: 50, energy: 100 });

    await addThrow(night);
    const justAfter = await getPlumState(night);
    const anHourLater = await getPlumState(new Date(night.getTime() + 60 * 60_000));

    expect(justAfter).toMatchObject({ sleep: null, wokenFrom: "night" });
    expect(anHourLater).toMatchObject({ sleep: "night", wokenFrom: null });
  });
});
