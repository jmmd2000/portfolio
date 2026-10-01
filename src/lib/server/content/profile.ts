import { asc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { profile, socials } from "$lib/server/db/schema";
import type { ProfileChanges } from "$lib/schemas/profile";

export type Profile = typeof profile.$inferSelect;
export type Social = typeof socials.$inferSelect;

/** Profile info */
export async function getProfile(): Promise<Profile> {
  const [profileRow] = await db.select().from(profile).limit(1);
  if (!profileRow) throw new Error("Profile info is missing");

  return profileRow;
}

/** The social links, in sort order. */
export async function getSocials(): Promise<Social[]> {
  return db.select().from(socials).orderBy(asc(socials.sort));
}

/** Saves the changed profile fields and returns the whole profile as stored */
export async function updateProfile(changes: ProfileChanges): Promise<Profile> {
  const [profileRow] = await db.update(profile).set(changes).where(eq(profile.id, 1)).returning();
  if (!profileRow) throw new Error("Profile info is missing");

  return profileRow;
}
