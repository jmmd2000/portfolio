import { and, asc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { education, experience, projects, skills } from "$lib/server/db/schema";

export type Job = typeof experience.$inferSelect;
export type SkillCategory = typeof skills.$inferSelect;
export type Qualification = typeof education.$inferSelect;
export type Project = typeof projects.$inferSelect;

export interface CV {
  jobs: Job[];
  skillCategories: SkillCategory[];
  qualifications: Qualification[];
  projects: Project[];
}

/**Returns everything needed for the CV except for the profile and socials */
export async function getCV(): Promise<CV> {
  const [jobs, skillCategories, qualifications, featuredProjects] = await Promise.all([
    db.select().from(experience).orderBy(asc(experience.sort)),
    db.select().from(skills).orderBy(asc(skills.sort)),
    db.select().from(education).orderBy(asc(education.sort)),
    db
      .select()
      .from(projects)
      .where(and(eq(projects.published, true), eq(projects.featured, true)))
      .orderBy(asc(projects.sort)),
  ]);

  return { jobs, skillCategories, qualifications, projects: featuredProjects };
}
