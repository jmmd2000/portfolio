import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { skills } from "$lib/server/db/schema";
import type { SkillCategoryInput } from "$lib/schemas/skillCategory";
import type { SkillCategory } from "./cv";
import { moveRow, nextSort } from "./sortOrder";

export async function createSkillCategory(input: SkillCategoryInput): Promise<SkillCategory> {
  const [created] = await db
    .insert(skills)
    .values({ ...input, sort: await nextSort(skills) })
    .returning();
  if (!created) throw new Error("The skill category wasn't created");

  return created;
}

export async function updateSkillCategory(id: number, input: SkillCategoryInput): Promise<SkillCategory | null> {
  const [updated] = await db.update(skills).set(input).where(eq(skills.id, id)).returning();
  return updated ?? null;
}

export async function deleteSkillCategory(id: number): Promise<boolean> {
  const deleted = await db.delete(skills).where(eq(skills.id, id)).returning({ id: skills.id });
  return deleted.length > 0;
}

/** Swaps a skill category with the one above or below it. Does nothing when it's already at that end */
export async function moveSkillCategory(id: number, direction: "up" | "down"): Promise<void> {
  await moveRow(skills, id, direction);
}
