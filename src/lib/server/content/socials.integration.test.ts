import { beforeEach, describe, expect, it } from "vitest";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { createSocial, getSocials, reorderSocials } from "./profile";

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
  await seedDatabase(testEnvironment.DATABASE_URL_TEST);
});

async function socialNames(): Promise<string[]> {
  return (await getSocials()).map(social => social.name);
}

describe("createSocial", () => {
  it("adds the new link after the others", async () => {
    await createSocial({ name: "Bluesky", url: "https://bsky.app/profile/jamesmddoyle" });

    expect(await socialNames()).toEqual(["GitHub", "LinkedIn", "Email", "Bluesky"]);
  });
});

describe("reorderSocials", () => {
  it("saves the new order", async () => {
    const [github, linkedin, email] = await getSocials();
    if (!github || !linkedin || !email) expect.unreachable("the seed has three links");

    expect(await reorderSocials([email.id, github.id, linkedin.id])).toBe(true);
    expect(await socialNames()).toEqual(["Email", "GitHub", "LinkedIn"]);
  });

  it("changes nothing unless the order has every link exactly once", async () => {
    const ids = (await getSocials()).map(social => social.id);
    const [firstID, secondID] = ids;
    if (firstID === undefined || secondID === undefined) expect.unreachable("the seed has three links");

    expect(await reorderSocials([secondID, firstID])).toBe(false);
    expect(await reorderSocials([...ids, 9999])).toBe(false);
    expect(await reorderSocials([firstID, firstID, secondID])).toBe(false);
    expect(await socialNames()).toEqual(["GitHub", "LinkedIn", "Email"]);
  });
});
