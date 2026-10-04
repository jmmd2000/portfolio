import { beforeEach, describe, expect, it } from "vitest";
import { socials } from "$lib/server/db/schema";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { getSocials } from "./socials";
import { moveRow, nextSort } from "./sortOrder";

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
  await seedDatabase(testEnvironment.DATABASE_URL_TEST);
});

async function socialNames(): Promise<string[]> {
  return (await getSocials()).map(social => social.name);
}

describe("nextSort", () => {
  it("is one more than the highest sort", async () => {
    expect(await nextSort(socials)).toBe(4);
  });

  it("is 1 when the table is empty", async () => {
    await wipeDatabase(testEnvironment.DATABASE_URL_TEST);

    expect(await nextSort(socials)).toBe(1);
  });
});

describe("moveRow", () => {
  it("swaps a row with the one above it", async () => {
    const [, , email] = await getSocials();
    if (!email) expect.unreachable("the seed has three links");

    await moveRow(socials, email.id, "up");
    expect(await socialNames()).toEqual(["GitHub", "Email", "LinkedIn"]);
  });

  it("swaps a row with the one below it", async () => {
    const [github] = await getSocials();
    if (!github) expect.unreachable("the seed has three links");

    await moveRow(socials, github.id, "down");
    expect(await socialNames()).toEqual(["LinkedIn", "GitHub", "Email"]);
  });

  it("leaves the order alone when the row is already at that end", async () => {
    const [github] = await getSocials();
    if (!github) expect.unreachable("the seed has three links");

    await moveRow(socials, github.id, "up");
    expect(await socialNames()).toEqual(["GitHub", "LinkedIn", "Email"]);
  });
});
