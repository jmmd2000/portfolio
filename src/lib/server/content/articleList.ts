import { articleDateTime, articleYear, formatArticleDate, hasDemo, readingMinutes } from "./articleDetails";
import type { PublishedArticle } from "./articles";

export interface ArticleListItem {
  slug: string;
  title: string;
  summary: string;
  /** "3 October 2026" */
  date: string;
  /** "2026-10-03", for the datetime attribute */
  dateTime: string;
  readingMinutes: number;
  hasDemo: boolean;
}

export interface ArticleYear {
  year: number;
  articles: ArticleListItem[];
}

export function toArticleListItem(article: PublishedArticle): ArticleListItem {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    date: formatArticleDate(article.publishedAt),
    dateTime: articleDateTime(article.publishedAt),
    readingMinutes: readingMinutes(article.body),
    hasDemo: hasDemo(article.body),
  };
}

/** Groups articles by the year they were published, keeping their order. Expects them newest first */
export function groupByYear(articles: PublishedArticle[]): ArticleYear[] {
  const years: ArticleYear[] = [];
  for (const article of articles) {
    const year = articleYear(article.publishedAt);
    const lastYear = years.at(-1);
    if (lastYear?.year === year) {
      lastYear.articles.push(toArticleListItem(article));
    } else {
      years.push({ year, articles: [toArticleListItem(article)] });
    }
  }
  return years;
}
