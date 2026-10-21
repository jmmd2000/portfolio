import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { articles } from "$lib/server/db/schema";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { countPublishedArticles, createArticle, deleteArticle, getArticleBySlug, getPublishedArticles, getPublishedArticleSlugs, getSlugRedirect, isSlugTaken, updateArticle } from "./articles";

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

describe("drafts", () => {
  beforeEach(async () => {
    await insertArticle({ slug: "draft", title: "Not ready", published: false, publishedAt: null });
  });

  it("never appear in the list, the slugs or the count", async () => {
    expect(await getPublishedArticles()).toEqual([]);
    expect(await getPublishedArticleSlugs()).toEqual([]);
    expect(await countPublishedArticles()).toBe(0);
  });

  it("are marked unpublished when fetched by their slug, so the article page can hide them", async () => {
    expect((await getArticleBySlug("draft"))?.published).toBe(false);
  });
});

it("returns null for a slug that doesn't exist", async () => {
  expect(await getArticleBySlug("missing")).toBeNull();
});

it("lists published articles newest first", async () => {
  await insertArticle({ slug: "older", publishedAt: new Date("2025-01-10T09:00:00Z") });
  await insertArticle({ slug: "newer", publishedAt: new Date("2026-06-01T09:00:00Z") });

  const slugs = (await getPublishedArticles()).map(article => article.slug);

  expect(slugs).toEqual(["newer", "older"]);
  expect(await countPublishedArticles()).toBe(2);
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
    expect(await getPublishedArticleSlugs()).not.toContain("new");
  });

  it("reports a slug as taken by another article, but not by the article being edited", async () => {
    const created = await createArticle({ title: "New", slug: "new", summary: "Not ready." });

    expect(await isSlugTaken("new")).toBe(true);
    expect(await isSlugTaken("new", created.id)).toBe(false);
    expect(await isSlugTaken("other")).toBe(false);
  });

  it("sets the publish date on first publish and keeps it when unpublished and published again", async () => {
    const created = await createArticle({ title: "New", slug: "new", summary: "Not ready." });
    const edit = { title: "New", slug: "new", summary: "Not ready.", body: "" };

    const published = await updateArticle(created.id, { ...edit, published: true });
    const firstDate = published?.publishedAt;
    expect(firstDate).toBeInstanceOf(Date);

    const unpublished = await updateArticle(created.id, { ...edit, published: false });
    expect(unpublished?.publishedAt).toEqual(firstDate);

    const republished = await updateArticle(created.id, { ...edit, published: true });
    expect(republished?.publishedAt).toEqual(firstDate);
  });
});

describe("renaming", () => {
  const edit = { title: "How the sand falls", summary: "One rule per material.", body: "" };

  async function addArticle(slug: string): Promise<number> {
    return (await createArticle({ title: "How the sand falls", slug, summary: "One rule per material." })).id;
  }

  it("keeps every old slug of a published article pointing at its current slug", async () => {
    const id = await addArticle("first");
    await updateArticle(id, { ...edit, slug: "first", published: true });

    await updateArticle(id, { ...edit, slug: "second", published: true });
    await updateArticle(id, { ...edit, slug: "third", published: true });

    expect(await getSlugRedirect("first")).toEqual({ slug: "third", published: true });
    expect(await getSlugRedirect("second")).toEqual({ slug: "third", published: true });
    expect(await getSlugRedirect("third")).toBeNull();
  });

  it("keeps the old slug of an article that was published and then unpublished, but says it isn't published", async () => {
    const id = await addArticle("first");
    await updateArticle(id, { ...edit, slug: "first", published: true });
    await updateArticle(id, { ...edit, slug: "first", published: false });

    await updateArticle(id, { ...edit, slug: "second", published: false });

    expect(await getSlugRedirect("first")).toEqual({ slug: "second", published: false });
  });

  it("keeps no old slug for a draft, or for a rename in the same save as the first publish", async () => {
    const id = await addArticle("draft");

    await updateArticle(id, { ...edit, slug: "renamed-draft", published: false });
    await updateArticle(id, { ...edit, slug: "published", published: true });

    expect(await getSlugRedirect("draft")).toBeNull();
    expect(await getSlugRedirect("renamed-draft")).toBeNull();
  });

  it("lets an article take back one of its own old slugs, which then stops redirecting", async () => {
    const id = await addArticle("first");
    await updateArticle(id, { ...edit, slug: "first", published: true });
    await updateArticle(id, { ...edit, slug: "second", published: true });

    expect(await isSlugTaken("first", id)).toBe(false);
    await updateArticle(id, { ...edit, slug: "first", published: true });

    expect(await getSlugRedirect("first")).toBeNull();
    expect(await getSlugRedirect("second")).toEqual({ slug: "first", published: true });
  });

  it("reports another article's old slug as taken", async () => {
    const id = await addArticle("first");
    await updateArticle(id, { ...edit, slug: "first", published: true });
    await updateArticle(id, { ...edit, slug: "second", published: true });
    const otherID = await addArticle("other");

    expect(await isSlugTaken("first")).toBe(true);
    expect(await isSlugTaken("first", otherID)).toBe(true);
  });

  it("frees an article's old slugs when the article is deleted", async () => {
    const id = await addArticle("first");
    await updateArticle(id, { ...edit, slug: "first", published: true });
    await updateArticle(id, { ...edit, slug: "second", published: true });

    await deleteArticle(id);

    expect(await getSlugRedirect("first")).toBeNull();
    expect(await isSlugTaken("first")).toBe(false);
  });
});
