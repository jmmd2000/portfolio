import { eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { counters } from "$lib/server/db/schema";

const counterName = "throws";

/** How many times every visitor together has thrown her ball */
export async function getThrowCount(): Promise<number> {
  const [row] = await db.select({ count: counters.count }).from(counters).where(eq(counters.name, counterName));
  return row?.count ?? 0;
}

/** Adds one throw to the total and returns the new total */
export async function addThrow(): Promise<number> {
  const [row] = await db
    .insert(counters)
    .values({ name: counterName, count: 1 })
    .onConflictDoUpdate({ target: counters.name, set: { count: sql`${counters.count} + 1` } })
    .returning({ count: counters.count });
  if (!row) throw new Error("The throw count wasn't saved");

  return row.count;
}
