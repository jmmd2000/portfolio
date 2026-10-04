import { beforeEach, describe, expect, it } from "vitest";
import { seedDatabase } from "$lib/server/db/seed";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { createSocial, getSocials } from "./socials";

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
