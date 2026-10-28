import { and, asc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { projects } from "$lib/server/db/schema";
import type { NewProjectInput, ProjectInput } from "$lib/schemas/project";
import { moveRow, nextSort } from "./sortOrder";

export type Project = typeof projects.$inferSelect;

const homeProjectCount = 3;

/** Every published project, in sort order. */
export async function getPublishedProjects(): Promise<Project[]> {
  return db.select().from(projects).where(eq(projects.published, true)).orderBy(asc(projects.sort));
}

/** The first three published, featured projects in sort order, for the home page. */
export async function getFeaturedProjects(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.published, true), eq(projects.featured, true)))
    .orderBy(asc(projects.sort))
    .limit(homeProjectCount);
}

/** The published projects picked for the CV, in sort order. */
export async function getCVProjects(): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(and(eq(projects.published, true), eq(projects.showOnCV, true)))
    .orderBy(asc(projects.sort));
}

/** How many projects are published, for the home page's link to the index. */
export async function countPublishedProjects(): Promise<number> {
  return db.$count(projects, eq(projects.published, true));
}

/** Every project, published or not, in sort order. For the admin */
export async function getAllProjects(): Promise<Project[]> {
  return db.select().from(projects).orderBy(asc(projects.sort));
}

export async function getProject(id: number): Promise<Project | null> {
  const [project] = await db.select().from(projects).where(eq(projects.id, id));
  return project ?? null;
}

/** Adds an unpublished project after the others and returns it */
export async function createProject(input: NewProjectInput): Promise<Project> {
  const [created] = await db
    .insert(projects)
    .values({ ...input, sort: await nextSort(projects) })
    .returning();
  if (!created) throw new Error("The project wasn't created");

  return created;
}

export async function updateProject(id: number, input: ProjectInput): Promise<Project | null> {
  const [updated] = await db.update(projects).set(input).where(eq(projects.id, id)).returning();
  return updated ?? null;
}

export async function deleteProject(id: number): Promise<boolean> {
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  return deleted.length > 0;
}

/** Swaps a project with the one above or below it. Does nothing when it's already at that end */
export async function moveProject(id: number, direction: "up" | "down"): Promise<void> {
  await moveRow(projects, id, direction);
}
