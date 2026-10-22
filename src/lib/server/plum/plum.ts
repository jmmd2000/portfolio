import { sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { plum } from "$lib/server/db/schema";
import type { PlumStats } from "$lib/plum/plumRules";

const decayStepMinutes = 15;
const decayCheckIntervalMilliseconds = 60_000;

/** How much each stat changes every 15 minutes. She gets hungrier and lonelier, and rests */
const decayPerStep = { food: -2, happiness: -1, energy: 5 };

/** Adds her row with its starting stats the first time anything needs it */
export async function ensurePlum(): Promise<void> {
  await db.insert(plum).values({ id: 1 }).onConflictDoNothing();
}

export async function getPlum(): Promise<PlumStats> {
  await ensurePlum();
  const [row] = await db.select({ food: plum.food, happiness: plum.happiness, energy: plum.energy }).from(plum);
  if (!row) throw new Error("Plum's row is missing");

  return row;
}

/**
 * Applies every whole 15-minute step that has passed since her stats last decayed, and moves `decayedAt` on by
 * those steps. It's one update that works out the steps from the row itself, so two runs at once can't apply the
 * same steps twice: the second waits for the first, then finds nothing left to apply.
 */
export async function decayPlum(now: Date): Promise<void> {
  await ensurePlum();

  const at = sql`${now.toISOString()}::timestamptz`;
  const steps = sql`floor(extract(epoch from (${at} - ${plum.decayedAt})) / ${decayStepMinutes * 60})::integer`;

  await db
    .update(plum)
    .set({
      food: sql`least(100, greatest(0, ${plum.food} + ${decayPerStep.food} * ${steps}))`,
      happiness: sql`least(100, greatest(0, ${plum.happiness} + ${decayPerStep.happiness} * ${steps}))`,
      energy: sql`least(100, greatest(0, ${plum.energy} + ${decayPerStep.energy} * ${steps}))`,
      decayedAt: sql`${plum.decayedAt} + make_interval(mins => ${decayStepMinutes} * ${steps})`,
    })
    .where(sql`${plum.decayedAt} <= ${at} - make_interval(mins => ${decayStepMinutes})`);
}

/** Decays her stats now and then checks once a minute, so she gets hungry whether anyone visits or not */
export function startPlumDecay(): void {
  void decayPlumNow();
  setInterval(() => void decayPlumNow(), decayCheckIntervalMilliseconds).unref();
}

async function decayPlumNow(): Promise<void> {
  try {
    await decayPlum(new Date());
  } catch (error) {
    console.error("Couldn't decay Plum's stats:", error);
  }
}
