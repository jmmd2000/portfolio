import { and, asc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { projects } from "$lib/server/db/schema";

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
