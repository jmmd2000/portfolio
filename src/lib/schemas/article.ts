// Rules for an article
import { z } from "zod";
import { checkbox } from "./checkbox";
import { requiredText } from "./requiredText";

const title = requiredText("title", 120);
const summary = requiredText("summary", 300);
const slug = z
  .string()
  .trim()
  .min(1, "Add a slug.")
  .max(80, "Keep the slug to 80 characters or fewer.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens, like my-first-article.");

const optionalProjectID = z
  .string()
  .trim()
  .refine(text => text === "" || /^\d+$/.test(text), "Pick a project from the list.")
  .transform(text => (text === "" ? null : Number(text)));

/** The fields a new article needs. The rest are filled in on the article's own page */
export const newArticleSchema = z.object({ title, slug, summary });

export const articleSchema = z.object({ title, slug, summary, body: z.string(), projectID: optionalProjectID, published: checkbox });

export const slugTakenMessage = "Another article already uses this slug.";

export type NewArticleInput = z.infer<typeof newArticleSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
