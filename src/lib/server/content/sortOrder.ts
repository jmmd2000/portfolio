import { asc, desc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { currently, projects, skills, socials } from "$lib/server/db/schema";

/** The content tables that are put in order by hand */
type SortedTable = typeof socials | typeof skills | typeof projects | typeof currently;

/** The sort number for a row added after all the others */
export async function nextSort(table: SortedTable): Promise<number> {
  const [last] = await db.select({ sort: table.sort }).from(table).orderBy(desc(table.sort)).limit(1);
  return (last?.sort ?? 0) + 1;
}

/** Swaps a row with the one above or below it. Does nothing when it's already at that end */
export async function moveRow(table: SortedTable, id: number, direction: "up" | "down"): Promise<void> {
  await db.transaction(async transaction => {
    const ordered = await transaction.select({ id: table.id, sort: table.sort }).from(table).orderBy(asc(table.sort));
    const index = ordered.findIndex(row => row.id === id);
    const row = ordered[index];
    const neighbour = ordered[direction === "up" ? index - 1 : index + 1];
    if (!row || !neighbour) return;

    await transaction.update(table).set({ sort: neighbour.sort }).where(eq(table.id, row.id));
    await transaction.update(table).set({ sort: row.sort }).where(eq(table.id, neighbour.id));
  });
}
