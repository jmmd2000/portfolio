import { and, asc, desc, eq, isNotNull, isNull, ne, or } from "drizzle-orm";
import { db } from "$lib/server/db";
import { articleSlugRedirects, articles, projects } from "$lib/server/db/schema";
import type { ArticleInput, NewArticleInput } from "$lib/schemas/article";

const homeArticleCount = 3;

export type Article = typeof articles.$inferSelect;

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

/** Every article, drafts included, newest first. For the admin */
export async function getAllArticles(): Promise<Article[]> {
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

export async function getArticle(id: number): Promise<Article | null> {
  const [article] = await db.select().from(articles).where(eq(articles.id, id));
  return article ?? null;
}

/**
 * Whether another article uses this slug now, or used it before a rename, since its old address still redirects
 * there. Pass the article being edited, so its own slugs, old and current, don't count.
 */
export async function isSlugTaken(slug: string, editedArticleID: number | null = null): Promise<boolean> {
  const sameSlug = eq(articles.slug, slug);
  const sameOldSlug = eq(articleSlugRedirects.oldSlug, slug);
  const [currentCount, oldCount] = await Promise.all([
    db.$count(articles, editedArticleID === null ? sameSlug : and(sameSlug, ne(articles.id, editedArticleID))),
    db.$count(articleSlugRedirects, editedArticleID === null ? sameOldSlug : and(sameOldSlug, ne(articleSlugRedirects.articleID, editedArticleID))),
  ]);
  return currentCount + oldCount > 0;
}

/** Adds a draft article with an empty body and returns it */
export async function createArticle(input: NewArticleInput): Promise<Article> {
  const [created] = await db
    .insert(articles)
    .values({ ...input, body: "" })
    .returning();
  if (!created) throw new Error("The article wasn't created");

  return created;
}

/**
 * Saves an article. The publish date is set the first time it's published and kept after that. Renaming an article
 * that was already published keeps its old slug as a redirect, and taking back one of its own old slugs removes
 * that redirect. Returns null when there's no article with the id.
 */
export async function updateArticle(id: number, input: ArticleInput): Promise<Article | null> {
  return db.transaction(async transaction => {
    const [existing] = await transaction.select().from(articles).where(eq(articles.id, id));
    if (!existing) return null;

    if (input.slug !== existing.slug) {
      await transaction.delete(articleSlugRedirects).where(and(eq(articleSlugRedirects.oldSlug, input.slug), eq(articleSlugRedirects.articleID, id)));
      // A slug only needs a redirect if it was public, so a draft's rename or a rename in the same save as the first publish leaves none
      if (existing.publishedAt !== null) await transaction.insert(articleSlugRedirects).values({ oldSlug: existing.slug, articleID: id });
    }

    const publishedAt = input.published && existing.publishedAt === null ? new Date() : existing.publishedAt;
    const [updated] = await transaction
      .update(articles)
      .set({ ...input, publishedAt })
      .where(eq(articles.id, id))
      .returning();
    return updated ?? null;
  });
}

export interface SlugRedirect {
  /** The article's current slug */
  slug: string;
  published: boolean;
}

/** Where an old slug points now: the article's current slug, and whether it's published. Null when the slug was never renamed away */
export async function getSlugRedirect(oldSlug: string): Promise<SlugRedirect | null> {
  const [redirect] = await db
    .select({ slug: articles.slug, published: articles.published })
    .from(articleSlugRedirects)
    .innerJoin(articles, eq(articleSlugRedirects.articleID, articles.id))
    .where(eq(articleSlugRedirects.oldSlug, oldSlug));
  return redirect ?? null;
}

/** The projects an article can belong to: those without an article, plus the edited article's own project */
export async function getProjectChoices(editedArticleID: number): Promise<ArticleProject[]> {
  return db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .leftJoin(articles, eq(articles.projectID, projects.id))
    .where(or(isNull(articles.id), eq(articles.id, editedArticleID)))
    .orderBy(asc(projects.sort));
}

export async function deleteArticle(id: number): Promise<boolean> {
  const deleted = await db.delete(articles).where(eq(articles.id, id)).returning({ id: articles.id });
  return deleted.length > 0;
}
