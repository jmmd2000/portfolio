import { asc, desc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { socials } from "$lib/server/db/schema";
import type { SocialInput } from "$lib/schemas/socials";

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
  await db.transaction(async transaction => {
    const ordered = await transaction.select().from(socials).orderBy(asc(socials.sort));
    const index = ordered.findIndex(social => social.id === id);
    const social = ordered[index];
    const neighbour = ordered[direction === "up" ? index - 1 : index + 1];
    if (!social || !neighbour) return;

    await transaction.update(socials).set({ sort: neighbour.sort }).where(eq(socials.id, social.id));
    await transaction.update(socials).set({ sort: social.sort }).where(eq(socials.id, neighbour.id));
  });
}
