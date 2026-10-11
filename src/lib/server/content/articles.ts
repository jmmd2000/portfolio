import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "$lib/server/db";
import { articles, projects } from "$lib/server/db/schema";

const homeArticleCount = 3;

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

interface ArticleFilter {
  slug?: string;
  limit?: number;
}

/** Published articles, newest first. A slug picks one article, and a limit keeps only the newest few */
async function findPublishedArticles({ slug, limit }: ArticleFilter = {}): Promise<PublishedArticle[]> {
  const query = db
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
    .where(and(eq(articles.published, true), slug === undefined ? undefined : eq(articles.slug, slug)))
    .orderBy(desc(articles.publishedAt))
    .$dynamic();
  const rows = limit === undefined ? await query : await query.limit(limit);

  return rows.map(toPublishedArticle);
}

export async function getPublishedArticles(): Promise<PublishedArticle[]> {
  return findPublishedArticles();
}

/** The three newest published articles, for the home page */
export async function getHomeArticles(): Promise<PublishedArticle[]> {
  return findPublishedArticles({ limit: homeArticleCount });
}

/** The published article with this slug, or null for a draft or a slug that doesn't exist */
export async function getPublishedArticle(slug: string): Promise<PublishedArticle | null> {
  const [article] = await findPublishedArticles({ slug });
  return article ?? null;
}

export interface ArticleLink {
  projectID: number;
  slug: string;
}

/** Each published article that belongs to a project, so the projects page can link to it */
export async function getPublishedArticleLinks(): Promise<ArticleLink[]> {
  const rows = await db
    .select({ projectID: articles.projectID, slug: articles.slug })
    .from(articles)
    .where(and(eq(articles.published, true), isNotNull(articles.projectID)));

  // The query already drops rows without a project, but Drizzle still types projectID as nullable
  const links: ArticleLink[] = [];
  for (const row of rows) {
    if (row.projectID !== null) links.push({ projectID: row.projectID, slug: row.slug });
  }
  return links;
}

/** The slugs of published articles, newest first, for the sitemap */
export async function getPublishedArticleSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: articles.slug }).from(articles).where(eq(articles.published, true)).orderBy(desc(articles.publishedAt));
  return rows.map(row => row.slug);
}

export async function countPublishedArticles(): Promise<number> {
  return db.$count(articles, eq(articles.published, true));
}
