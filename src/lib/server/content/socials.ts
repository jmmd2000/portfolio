import { asc, desc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { socials } from "$lib/server/db/schema";
import type { SocialChanges, SocialInput } from "$lib/schemas/socials";

export type Social = typeof socials.$inferSelect;

/** The social links, in sort order */
export async function getSocials(): Promise<Social[]> {
  return db.select().from(socials).orderBy(asc(socials.sort));
}

/** Adds a social link after the others and returns it */
export async function createSocial(input: SocialInput): Promise<Social> {
  const [lastSocial] = await db.select({ sort: socials.sort }).from(socials).orderBy(desc(socials.sort)).limit(1);
  const [created] = await db
    .insert(socials)
    .values({ ...input, sort: (lastSocial?.sort ?? 0) + 1 })
    .returning();
  if (!created) throw new Error("The social wasn't created");

  return created;
}

/** Saves the changed fields of one social link, returns null when no link has that id */
export async function updateSocial(id: number, changes: SocialChanges): Promise<Social | null> {
  const [updated] = await db.update(socials).set(changes).where(eq(socials.id, id)).returning();
  return updated ?? null;
}

/** Deletes one social link, returns false when no link has that id */
export async function deleteSocial(id: number): Promise<boolean> {
  const deleted = await db.delete(socials).where(eq(socials.id, id)).returning({ id: socials.id });
  return deleted.length > 0;
}

/**
 * Puts the social links in a given order
 * Returns false and changes nothing unless the list has every link exactly once
 */
export async function reorderSocials(order: number[]): Promise<boolean> {
  return db.transaction(async transaction => {
    const existing = await transaction.select({ id: socials.id }).from(socials);
    const existingIDs = new Set(existing.map(social => social.id));
    const hasEveryLinkOnce = order.length === existingIDs.size && new Set(order).size === order.length && order.every(id => existingIDs.has(id));
    if (!hasEveryLinkOnce) return false;

    for (const [index, id] of order.entries()) {
      await transaction
        .update(socials)
        .set({ sort: index + 1 })
        .where(eq(socials.id, id));
    }
    return true;
  });
}
