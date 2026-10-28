import type { ImageReferences } from "$lib/server/content/imageReferences";

/**
 * What uses each image address, like "Article: How the sand falls" or "CV: Software Engineer at Ericsson".
 * An article uses an image when its body contains the address. The other fields hold one address each.
 * Every address gets an entry, empty when nothing uses it.
 */
export function imageUses(urls: string[], references: ImageReferences): Map<string, string[]> {
  return new Map(
    urls.map(url => [
      url,
      [
        ...references.articles.filter(article => article.body.includes(url)).map(article => `Article: ${article.title}`),
        ...references.projects.filter(project => project.imageURL === url).map(project => `Project: ${project.title}`),
        ...references.currentlyRows.filter(row => row.imageURL === url).map(row => `Currently: ${row.label} ${row.title}`),
        ...references.jobs.filter(job => job.logoURL === url).map(job => `CV: ${job.title} at ${job.company}`),
      ],
    ])
  );
}
