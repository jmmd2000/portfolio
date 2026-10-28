import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { projects, socials } from "./schema";
import { seedDatabase } from "./seed";
import { seedData } from "./seedData";
import { testEnvironment } from "./testEnvironment";
import { wipeDatabase } from "./wipe";

const databaseURL = testEnvironment.DATABASE_URL_TEST;
const client = postgres(databaseURL, { max: 1, onnotice: () => {} });
const database = drizzle(client, { casing: "snake_case" });

beforeEach(async () => {
  await wipeDatabase(databaseURL);
});

afterAll(async () => {
  await client.end();
});

describe("seedDatabase", () => {
  it("changes nothing on a second run", async () => {
    await seedDatabase(databaseURL);

    const secondRun = await seedDatabase(databaseURL);

    expect(secondRun.seededTables).toEqual([]);
    expect(await database.$count(projects)).toBe(seedData.projects.length);
  });

  it("leaves a table that has rows alone and still fills the empty ones", async () => {
    await database.insert(socials).values({ name: "Bluesky", url: "https://bsky.app/profile/jamesmddoyle", sort: 1 });

    const result = await seedDatabase(databaseURL);

    expect(result.skippedTables).toEqual(["socials"]);
    expect(result.seededTables).toContain("projects");
    const socialNames = (await database.select().from(socials)).map(social => social.name);
    expect(socialNames).toEqual(["Bluesky"]);
  });
});
