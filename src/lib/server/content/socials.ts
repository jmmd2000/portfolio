import { asc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { socials } from "$lib/server/db/schema";
import type { SocialInput } from "$lib/schemas/socials";
import { moveRow, nextSort } from "./sortOrder";

export type Social = typeof socials.$inferSelect;

/** The social links, in sort order */
export async function getSocials(): Promise<Social[]> {
  return db.select().from(socials).orderBy(asc(socials.sort));
}

/** Adds a social link after the others and returns it */
export async function createSocial(input: SocialInput): Promise<Social> {
  const [created] = await db
    .insert(socials)
    .values({ ...input, sort: await nextSort(socials) })
    .returning();
  if (!created) throw new Error("The social wasn't created");

  return created;
}

/** Saves one social link, returns null when no link has that id */
export async function updateSocial(id: number, input: SocialInput): Promise<Social | null> {
  const [updated] = await db.update(socials).set(input).where(eq(socials.id, id)).returning();
  return updated ?? null;
}

/** Deletes one social link, returns false when no link has that id */
export async function deleteSocial(id: number): Promise<boolean> {
  const deleted = await db.delete(socials).where(eq(socials.id, id)).returning({ id: socials.id });
  return deleted.length > 0;
}

/** Swaps a social link with the one above or below it. Does nothing when it's already at that end */
export async function moveSocial(id: number, direction: "up" | "down"): Promise<void> {
  await moveRow(socials, id, direction);
}
