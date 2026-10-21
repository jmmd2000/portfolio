import { describe, expect, it } from "vitest";
import { groupByYear } from "./articleList";
import type { PublishedArticle } from "./articles";

function article(slug: string, publishedAt: string): PublishedArticle {
  return { slug, title: slug, summary: "", body: "", publishedAt: new Date(publishedAt) };
}

describe("groupByYear", () => {
  it("groups articles by year and keeps their order", () => {
    const years = groupByYear([article("c", "2026-09-01T09:00:00Z"), article("b", "2026-02-01T09:00:00Z"), article("a", "2024-05-01T09:00:00Z")]);

    expect(years.map(group => [group.year, group.articles.map(item => item.slug)])).toEqual([
      [2026, ["c", "b"]],
      [2024, ["a"]],
    ]);
  });

  it("returns no years for no articles", () => {
    expect(groupByYear([])).toEqual([]);
  });
});
