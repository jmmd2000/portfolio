import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { currently } from "$lib/server/db/schema";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { createCurrentlyRow, getShownCurrentlyRows } from "./currently";

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
  await seedDatabase(testEnvironment.DATABASE_URL_TEST);
});

async function shownTitles(): Promise<string[]> {
  return (await getShownCurrentlyRows()).map(row => row.title);
}

describe("getShownCurrentlyRows", () => {
  it("leaves out hidden rows", async () => {
    await db.update(currently).set({ shown: false }).where(eq(currently.title, "Fallout 4"));

    expect(await shownTitles()).toEqual(["Bon Iver, Bon Iver", "Breaking Bad", "To Kill a Mockingbird"]);
  });

  it("returns only the first four shown rows", async () => {
    await createCurrentlyRow({ label: "Building", title: "This site", subtitle: null, url: null, imageURL: null, shown: true });

    expect(await shownTitles()).toEqual(["Bon Iver, Bon Iver", "Fallout 4", "Breaking Bad", "To Kill a Mockingbird"]);
  });

  it("fills a hidden row's place from the rows after it", async () => {
    await createCurrentlyRow({ label: "Building", title: "This site", subtitle: null, url: null, imageURL: null, shown: true });
    await db.update(currently).set({ shown: false }).where(eq(currently.title, "Bon Iver, Bon Iver"));

    expect(await shownTitles()).toEqual(["Fallout 4", "Breaking Bad", "To Kill a Mockingbird", "This site"]);
  });
});
