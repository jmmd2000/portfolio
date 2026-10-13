import { getPublishedArticleLinks } from "$lib/server/content/articles";
import { getPublishedProjects } from "$lib/server/content/projects";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const [projects, articleLinks] = await Promise.all([getPublishedProjects(), getPublishedArticleLinks()]);
  const slugByProjectID = new Map(articleLinks.map(link => [link.projectID, link.slug]));

  return { projects: projects.map(project => ({ ...project, writeUpSlug: slugByProjectID.get(project.id) ?? null })) };
};
