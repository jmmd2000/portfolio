import { eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { counters, plum } from "$lib/server/db/schema";
import { sleepState, wokenUpMilliseconds } from "$lib/plum/plumSleep";
import { ensurePlum } from "./plum";

const counterName = "throws";

/** How many times every visitor together has thrown her ball */
export async function getThrowCount(): Promise<number> {
  const [row] = await db.select({ count: counters.count }).from(counters).where(eq(counters.name, counterName));
  return row?.count ?? 0;
}

/**
 * Adds one throw to the total and returns the new total. Each throw takes 1 energy and adds 1 happiness, kept
 * between 0 and 100. Her row is locked first, so whether she's asleep can't change before the update. A throw
 * while she's asleep wakes her for an hour, the same as playing.
 */
export async function addThrow(now: Date): Promise<number> {
  await ensurePlum();

  return await db.transaction(async transaction => {
    const [current] = await transaction.select({ energy: plum.energy, awakeUntil: plum.awakeUntil }).from(plum).for("update");
    if (!current) throw new Error("Plum's row is missing");
    const { sleep } = sleepState(current.energy, current.awakeUntil, now);

    const awakeUntil = sleep ? new Date(now.getTime() + wokenUpMilliseconds) : current.awakeUntil;
    await transaction
      .update(plum)
      .set({ happiness: sql`least(100, ${plum.happiness} + 1)`, energy: sql`greatest(0, ${plum.energy} - 1)`, awakeUntil })
      .where(eq(plum.id, 1));

    const [row] = await transaction
      .insert(counters)
      .values({ name: counterName, count: 1 })
      .onConflictDoUpdate({ target: counters.name, set: { count: sql`${counters.count} + 1` } })
      .returning({ count: counters.count });
    if (!row) throw new Error("The throw count wasn't saved");

    return row.count;
  });
}
