import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { education } from "$lib/server/db/schema";
import type { QualificationInput } from "$lib/schemas/qualification";
import type { Qualification } from "./cv";

export async function createQualification(input: QualificationInput): Promise<Qualification> {
  const [created] = await db.insert(education).values(input).returning();
  if (!created) throw new Error("The qualification wasn't created");

  return created;
}

export async function updateQualification(id: number, input: QualificationInput): Promise<Qualification | null> {
  const [updated] = await db.update(education).set(input).where(eq(education.id, id)).returning();
  return updated ?? null;
}

export async function deleteQualification(id: number): Promise<boolean> {
  const deleted = await db.delete(education).where(eq(education.id, id)).returning({ id: education.id });
  return deleted.length > 0;
}
