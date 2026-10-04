import { asc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { currently } from "$lib/server/db/schema";
import type { CurrentlyRowInput } from "$lib/schemas/currentlyRow";
import { moveRow, nextSort } from "./sortOrder";

export type CurrentlyRow = typeof currently.$inferSelect;

/** Every row, shown or hidden, in sort order. For the admin */
export async function getCurrentlyRows(): Promise<CurrentlyRow[]> {
  return db.select().from(currently).orderBy(asc(currently.sort));
}

/** Adds a row after the others and returns it */
export async function createCurrentlyRow(input: CurrentlyRowInput): Promise<CurrentlyRow> {
  const [created] = await db
    .insert(currently)
    .values({ ...input, sort: await nextSort(currently) })
    .returning();
  if (!created) throw new Error("The row wasn't created");

  return created;
}

export async function updateCurrentlyRow(id: number, input: CurrentlyRowInput): Promise<CurrentlyRow | null> {
  const [updated] = await db.update(currently).set(input).where(eq(currently.id, id)).returning();
  return updated ?? null;
}

export async function deleteCurrentlyRow(id: number): Promise<boolean> {
  const deleted = await db.delete(currently).where(eq(currently.id, id)).returning({ id: currently.id });
  return deleted.length > 0;
}

/** Swaps a row with the one above or below it. Does nothing when it's already at that end */
export async function moveCurrentlyRow(id: number, direction: "up" | "down"): Promise<void> {
  await moveRow(currently, id, direction);
}
