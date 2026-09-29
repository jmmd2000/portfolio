import { asc } from "drizzle-orm";
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

/** Returns everything needed for the CV except for the profile and socials */
export async function getCV(): Promise<CV> {
  const [jobs, skillCategories, qualifications, cvProjects] = await Promise.all([
    db.select().from(experience).orderBy(asc(experience.sort)),
    db.select().from(skills).orderBy(asc(skills.sort)),
    db.select().from(education).orderBy(asc(education.sort)),
    getCVProjects(),
  ]);

  return { jobs, skillCategories, qualifications, projects: cvProjects };
}
