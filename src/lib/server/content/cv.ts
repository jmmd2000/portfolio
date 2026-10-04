import { asc, desc } from "drizzle-orm";
import { db } from "$lib/server/db";
import { education, experience, skills } from "$lib/server/db/schema";
import { getCVProjects, type Project } from "./projects";

export type Job = typeof experience.$inferSelect;
export type SkillCategory = typeof skills.$inferSelect;
export type Qualification = typeof education.$inferSelect;

export interface CV {
  jobs: Job[];
  skillCategories: SkillCategory[];
  qualifications: Qualification[];
  projects: Project[];
}

/**
 * Returns everything needed for the CV except for the profile and socials. Jobs and qualifications are newest
 * first: current jobs, then by when they ended, then by when they started.
 */
export async function getCV(): Promise<CV> {
  const [jobs, skillCategories, qualifications, cvProjects] = await Promise.all([
    // Postgres puts nulls first when sorting descending, and a null end date means a current job
    db.select().from(experience).orderBy(desc(experience.endDate), desc(experience.startDate)),
    db.select().from(skills).orderBy(asc(skills.sort)),
    db.select().from(education).orderBy(desc(education.endYear), desc(education.startYear)),
    getCVProjects(),
  ]);

  return { jobs, skillCategories, qualifications, projects: cvProjects };
}
