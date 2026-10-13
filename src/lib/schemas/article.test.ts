import { describe, expect, it } from "vitest";
import { articleSchema, articleSlugFrom, newArticleSchema } from "./article";

const typedArticle = { title: "How the sand falls", slug: "how-the-sand-falls", summary: "One rule per material." };

function slugError(slug: string): string | undefined {
  const result = newArticleSchema.safeParse({ ...typedArticle, slug });
  if (result.success) return undefined;
  return result.error.issues.find(issue => issue.path[0] === "slug")?.message;
}

describe("newArticleSchema", () => {
  it("accepts a slug of lowercase letters, numbers and single hyphens, trimmed", () => {
    expect(newArticleSchema.parse({ ...typedArticle, slug: "  albums-of-2025 " }).slug).toBe("albums-of-2025");
  });

  it.each(["How-The-Sand", "how the sand", "how--the-sand", "-how-the-sand", "how-the-sand-", "how_the_sand", "café"])("refuses the slug %s", slug => {
    expect(slugError(slug)).toBe("Use lowercase letters, numbers and single hyphens, like my-first-article.");
  });

  it("asks for a slug when it's empty", () => {
    expect(slugError("   ")).toBe("Add a slug.");
  });
});

describe("articleSchema", () => {
  const typedEdit = { ...typedArticle, body: "Some text." };

  it("reads no project as null and a chosen project as its id", () => {
    expect(articleSchema.parse({ ...typedEdit, projectID: "" }).projectID).toBeNull();
    expect(articleSchema.parse({ ...typedEdit, projectID: "7" }).projectID).toBe(7);
  });

  it("refuses a project that isn't an id", () => {
    expect(articleSchema.safeParse({ ...typedEdit, projectID: "seven" }).success).toBe(false);
  });

  it("refuses a body over 100,000 characters", () => {
    expect(articleSchema.safeParse({ ...typedEdit, body: "a".repeat(100_000), projectID: "" }).success).toBe(true);
    expect(articleSchema.safeParse({ ...typedEdit, body: "a".repeat(100_001), projectID: "" }).success).toBe(false);
  });

  it("reads a ticked Published box as true, and a missing one as false", () => {
    expect(articleSchema.parse({ ...typedEdit, projectID: "", published: "on" }).published).toBe(true);
    expect(articleSchema.parse({ ...typedEdit, projectID: "" }).published).toBe(false);
  });
});

describe("articleSlugFrom", () => {
  it("makes a slug the slug rules accept", () => {
    const slug = articleSlugFrom("Svelte 5: runes & more!");

    expect(slug).toBe("svelte-5-runes-more");
    expect(newArticleSchema.safeParse({ title: "A", slug, summary: "B" }).success).toBe(true);
  });

  it("cuts a long title at the last whole word that fits in 80 characters", () => {
    const slug = articleSlugFrom(`${"word ".repeat(15)}ending`);

    expect(slug).toBe(Array(15).fill("word").join("-"));
  });

  it("keeps a word that ends exactly at 80 characters", () => {
    const slug = articleSlugFrom(`${"a".repeat(75)} last word`);

    expect(slug).toBe(`${"a".repeat(75)}-last`);
  });
});
