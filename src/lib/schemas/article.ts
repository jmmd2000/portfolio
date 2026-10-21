// Rules for an article
import { z } from "zod";
import { slugify } from "$lib/slugify";
import { checkbox } from "./checkbox";
import { requiredText } from "./requiredText";

const title = requiredText("title", 120);
const summary = requiredText("summary", 300);
const slugMaxLength = 80;

const slug = z
  .string()
  .trim()
  .min(1, "Add a slug.")
  .max(slugMaxLength, `Keep the slug to ${slugMaxLength} characters or fewer.`)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens, like my-first-article.");

// Below the server's 512KB request limit, even when every character takes several bytes
export const articleBody = z.string().max(100_000, "Keep the body to 100,000 characters or fewer.");

/** The fields a new article needs. The rest are filled in on the article's own page */
export const newArticleSchema = z.object({ title, slug, summary });

export const articleSchema = z.object({ title, slug, summary, body: articleBody, published: checkbox });

/** A slug for an article from its title. A long one is cut at the last whole word that fits in 80 characters */
export function articleSlugFrom(title: string): string {
  const slug = slugify(title);
  if (slug.length <= slugMaxLength) return slug;

  // One character past the limit, so a word that ends exactly at the limit is kept whole
  const fitting = slug.slice(0, slugMaxLength + 1);
  const lastHyphen = fitting.lastIndexOf("-");
  return lastHyphen > 0 ? fitting.slice(0, lastHyphen) : slug.slice(0, slugMaxLength);
}

export const slugTakenMessage = "Another article uses or used this slug.";

export type NewArticleInput = z.infer<typeof newArticleSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
