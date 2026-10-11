import { describe, expect, it } from "vitest";
import { newArticleSchema } from "./article";

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
