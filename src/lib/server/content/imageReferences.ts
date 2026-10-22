import { db } from "$lib/server/db";
import { articles, currently, experience, projects } from "$lib/server/db/schema";

/** Every field that can hold an image address, with what's needed to name its row */
export interface ImageReferences {
  articles: { title: string; body: string }[];
  projects: { title: string; imageURL: string }[];
  currentlyRows: { label: string; title: string; imageURL: string | null }[];
  jobs: { title: string; company: string; logoURL: string }[];
}

export async function getImageReferences(): Promise<ImageReferences> {
  const [articleRows, projectRows, currentlyRows, jobs] = await Promise.all([
    db.select({ title: articles.title, body: articles.body }).from(articles),
    db.select({ title: projects.title, imageURL: projects.imageURL }).from(projects),
    db.select({ label: currently.label, title: currently.title, imageURL: currently.imageURL }).from(currently),
    db.select({ title: experience.title, company: experience.company, logoURL: experience.logoURL }).from(experience),
  ]);
  return { articles: articleRows, projects: projectRows, currentlyRows, jobs };
}
