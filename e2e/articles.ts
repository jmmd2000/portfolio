import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { articles, projects } from "$lib/server/db/schema";
import { e2eEnvironment } from "./environment";

// sample article creation for testing
export async function insertArticle(overrides: Partial<typeof articles.$inferInsert> = {}): Promise<void> {
  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  const database = drizzle(client, { casing: "snake_case" });

  try {
    await database.insert(articles).values({
      slug: "how-the-sand-falls",
      title: "How the sand falls",
      summary: "One rule per material.",
      body: "## The grid\n\nEach cell holds one material.",
      published: true,
      publishedAt: new Date("2026-10-03T09:00:00Z"),
      ...overrides,
    });
  } finally {
    await client.end();
  }
}

/** The id of a seeded project, so an article can belong to it */
export async function findProjectID(title: string): Promise<number> {
  const client = postgres(e2eEnvironment.DATABASE_URL_TEST_E2E, { max: 1, onnotice: () => {} });
  const database = drizzle(client, { casing: "snake_case" });

  try {
    const [project] = await database.select({ id: projects.id }).from(projects).where(eq(projects.title, title));
    if (!project) throw new Error(`No seeded project called "${title}"`);
    return project.id;
  } finally {
    await client.end();
  }
}
