import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { profile } from "$lib/server/db/schema";
import type { ProfileInput } from "$lib/schemas/profile";

export type Profile = typeof profile.$inferSelect;

/** Profile info */
export async function getProfile(): Promise<Profile> {
  const [profileRow] = await db.select().from(profile).limit(1);
  if (!profileRow) throw new Error("Profile info is missing");

  return profileRow;
}

/** Saves the profile and returns it as stored */
export async function updateProfile(input: ProfileInput): Promise<Profile> {
  const [profileRow] = await db.update(profile).set(input).where(eq(profile.id, 1)).returning();
  if (!profileRow) throw new Error("Profile info is missing");

  return profileRow;
}
