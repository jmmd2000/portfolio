import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { experience } from "$lib/server/db/schema";
import type { JobInput } from "$lib/schemas/job";
import type { Job } from "./cv";

export async function createJob(input: JobInput): Promise<Job> {
  const [created] = await db.insert(experience).values(input).returning();
  if (!created) throw new Error("The job wasn't created");

  return created;
}

export async function updateJob(id: number, input: JobInput): Promise<Job | null> {
  const [updated] = await db.update(experience).set(input).where(eq(experience.id, id)).returning();
  return updated ?? null;
}

export async function deleteJob(id: number): Promise<boolean> {
  const deleted = await db.delete(experience).where(eq(experience.id, id)).returning({ id: experience.id });
  return deleted.length > 0;
}
