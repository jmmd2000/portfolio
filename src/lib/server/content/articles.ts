import { and, desc, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { articles, projects } from "$lib/server/db/schema";

export interface ArticleProject {
  id: number;
  title: string;
}

export interface PublishedArticle {
  slug: string;
  title: string;
  summary: string;
  body: string;
  publishedAt: Date;
  /** The project the article is a write-up for. Null when it has none, or when that project isn't published */
  project: ArticleProject | null;
}

interface PublishedArticleRow {
  slug: string;
  title: string;
  summary: string;
  body: string;
  publishedAt: Date | null;
  projectID: number | null;
  projectTitle: string | null;
}

function toPublishedArticle(row: PublishedArticleRow): PublishedArticle {
  // The database refuses a published article without a date, so this only fails if that check is removed
  if (row.publishedAt === null) throw new Error(`The article "${row.slug}" is published but has no publish date`);

  const project = row.projectID === null || row.projectTitle === null ? null : { id: row.projectID, title: row.projectTitle };
  return { slug: row.slug, title: row.title, summary: row.summary, body: row.body, publishedAt: row.publishedAt, project };
}

/** Published articles, newest first. With a slug, only the article with that slug */
async function findPublishedArticles(slug: string | null): Promise<PublishedArticle[]> {
  const rows = await db
    .select({
      slug: articles.slug,
      title: articles.title,
      summary: articles.summary,
      body: articles.body,
      publishedAt: articles.publishedAt,
      projectID: projects.id,
      projectTitle: projects.title,
    })
    .from(articles)
    .leftJoin(projects, and(eq(articles.projectID, projects.id), eq(projects.published, true)))
    .where(and(eq(articles.published, true), slug === null ? undefined : eq(articles.slug, slug)))
    .orderBy(desc(articles.publishedAt));

  return rows.map(toPublishedArticle);
}

export async function getPublishedArticles(): Promise<PublishedArticle[]> {
  return findPublishedArticles(null);
}

/** The published article with this slug, or null for a draft or a slug that doesn't exist */
export async function getPublishedArticle(slug: string): Promise<PublishedArticle | null> {
  const [article] = await findPublishedArticles(slug);
  return article ?? null;
}

/** The slugs of published articles, newest first, for the sitemap */
export async function getPublishedArticleSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: articles.slug }).from(articles).where(eq(articles.published, true)).orderBy(desc(articles.publishedAt));
  return rows.map(row => row.slug);
}

export async function countPublishedArticles(): Promise<number> {
  return db.$count(articles, eq(articles.published, true));
}
