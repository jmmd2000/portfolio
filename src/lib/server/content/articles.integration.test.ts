import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { articles, projects } from "$lib/server/db/schema";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { countPublishedArticles, createArticle, getPublishedArticle, getPublishedArticleLinks, getPublishedArticles, getPublishedArticleSlugs, isSlugTaken } from "./articles";

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
  await seedDatabase(testEnvironment.DATABASE_URL_TEST);
});

async function insertArticle(overrides: Partial<typeof articles.$inferInsert> = {}): Promise<void> {
  await db.insert(articles).values({
    slug: "sand",
    title: "How the sand falls",
    summary: "One rule per material.",
    body: "Some text.",
    published: true,
    publishedAt: new Date("2026-10-03T09:00:00Z"),
    ...overrides,
  });
}

async function insertProject(published: boolean): Promise<number> {
  const [project] = await db
    .insert(projects)
    .values({ title: "SandSim", description: "Falling sand.", imageURL: "https://assets.jamesmddoyle.com/sandsim.webp", published, sort: 99 })
    .returning({ id: projects.id });
  if (!project) throw new Error("The project wasn't created");
  return project.id;
}

describe("drafts", () => {
  beforeEach(async () => {
    await insertArticle({ slug: "draft", title: "Not ready", published: false, publishedAt: null });
  });

  it("never appear in the list, the slugs or the count", async () => {
    expect(await getPublishedArticles()).toEqual([]);
    expect(await getPublishedArticleSlugs()).toEqual([]);
    expect(await countPublishedArticles()).toBe(0);
  });

  it("can't be fetched by their slug", async () => {
    expect(await getPublishedArticle("draft")).toBeNull();
  });
});

it("returns null for a slug that doesn't exist", async () => {
  expect(await getPublishedArticle("missing")).toBeNull();
});

it("lists published articles newest first", async () => {
  await insertArticle({ slug: "older", publishedAt: new Date("2025-01-10T09:00:00Z") });
  await insertArticle({ slug: "newer", publishedAt: new Date("2026-06-01T09:00:00Z") });

  const slugs = (await getPublishedArticles()).map(article => article.slug);

  expect(slugs).toEqual(["newer", "older"]);
  expect(await countPublishedArticles()).toBe(2);
});

describe("the project an article belongs to", () => {
  it("is included when the project is published", async () => {
    const projectID = await insertProject(true);
    await insertArticle({ projectID });

    expect((await getPublishedArticle("sand"))?.project).toEqual({ id: projectID, title: "SandSim" });
  });

  it("is left out when the project isn't published, so the article doesn't link to a missing project", async () => {
    await insertArticle({ projectID: await insertProject(false) });

    expect((await getPublishedArticle("sand"))?.project).toBeNull();
  });

  it("is cleared when the project is deleted, and the article stays", async () => {
    const projectID = await insertProject(true);
    await insertArticle({ projectID });

    await db.delete(projects).where(eq(projects.id, projectID));

    expect((await getPublishedArticle("sand"))?.project).toBeNull();
  });

  it("gets a link to its article only once the article is published", async () => {
    const projectID = await insertProject(true);
    await insertArticle({ slug: "draft", projectID, published: false, publishedAt: null });
    await insertArticle({ slug: "no-project" });
    expect(await getPublishedArticleLinks()).toEqual([]);

    await db.update(articles).set({ published: true, publishedAt: new Date() }).where(eq(articles.slug, "draft"));

    expect(await getPublishedArticleLinks()).toEqual([{ projectID, slug: "draft" }]);
  });

  it("can only have one article", async () => {
    const projectID = await insertProject(true);
    await insertArticle({ projectID });

    await expect(insertArticle({ slug: "second", projectID })).rejects.toThrow();
  });
});

describe("the articles table", () => {
  it("refuses a published article without a publish date", async () => {
    await expect(insertArticle({ publishedAt: null })).rejects.toThrow();
  });

  it("refuses a second article with the same slug", async () => {
    await insertArticle();

    await expect(insertArticle({ title: "Another" })).rejects.toThrow();
  });

  it("moves updatedAt forward when an article is edited", async () => {
    const startedAt = new Date("2026-01-01T00:00:00Z");
    await insertArticle({ updatedAt: startedAt });

    await db.update(articles).set({ title: "Edited" }).where(eq(articles.slug, "sand"));

    const [edited] = await db.select({ updatedAt: articles.updatedAt }).from(articles);
    expect(edited?.updatedAt.getTime()).toBeGreaterThan(startedAt.getTime());
  });
});

describe("admin editing", () => {
  it("adds a new article as a draft, so it stays off the site", async () => {
    const created = await createArticle({ title: "New", slug: "new", summary: "Not ready." });

    expect(created.published).toBe(false);
    expect(created.publishedAt).toBeNull();
    expect(await getPublishedArticle("new")).toBeNull();
  });

  it("reports a slug as taken by another article, but not by the article being edited", async () => {
    const created = await createArticle({ title: "New", slug: "new", summary: "Not ready." });

    expect(await isSlugTaken("new")).toBe(true);
    expect(await isSlugTaken("new", created.id)).toBe(false);
    expect(await isSlugTaken("other")).toBe(false);
  });
});
