import { asc } from "drizzle-orm";
import { db } from "$lib/server/db";
import { profile, socials } from "$lib/server/db/schema";

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
