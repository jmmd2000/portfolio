import { beforeEach, describe, expect, it } from "vitest";
import { db } from "$lib/server/db";
import { visitorHashes, visitorSecrets } from "$lib/server/db/schema";
import { testEnvironment } from "$lib/server/db/testEnvironment";
import { wipeDatabase } from "$lib/server/db/wipe";
import { countVisit, deleteEarlierVisitorDays, getVisitorCount, type Visit } from "./visits";

const browser = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const morning = new Date("2026-10-22T09:00:00Z");
const nextMorning = new Date("2026-10-23T09:00:00Z");

function visit(address: string, at = morning): Visit {
  return { address, userAgent: browser, signedIn: false, at };
}

beforeEach(async () => {
  await wipeDatabase(testEnvironment.DATABASE_URL_TEST);
});

describe("countVisit", () => {
  it("counts the same IP once a day", async () => {
    await countVisit(visit("203.0.113.7"));
    await countVisit(visit("203.0.113.7", new Date("2026-10-22T21:00:00Z")));

    expect(await getVisitorCount()).toBe(1);
  });

  it("counts the same IP again on the next Irish date", async () => {
    await countVisit(visit("203.0.113.7"));
    await countVisit(visit("203.0.113.7", nextMorning));

    expect(await getVisitorCount()).toBe(2);
  });

  it("doesn't count visits while signed in or from crawlers", async () => {
    await countVisit({ ...visit("203.0.113.7"), signedIn: true });
    await countVisit({ ...visit("203.0.113.8"), userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" });

    expect(await getVisitorCount()).toBe(0);
  });

  it("never loses a count when different visitors arrive together", async () => {
    await Promise.all(Array.from({ length: 50 }, (_, index) => countVisit(visit(`203.0.113.${index + 1}`))));

    expect(await getVisitorCount()).toBe(50);
  });

  it("counts one visitor once when their first visits of a new day arrive together", async () => {
    await Promise.all(Array.from({ length: 20 }, () => countVisit(visit("203.0.113.7"))));

    expect(await getVisitorCount()).toBe(1);
    expect(await db.$count(visitorSecrets)).toBe(1);
  });
});

describe("deleteEarlierVisitorDays", () => {
  it("deletes earlier dates' secrets and hashes and keeps today's", async () => {
    await countVisit(visit("203.0.113.7"));
    await countVisit(visit("203.0.113.8", nextMorning));

    await deleteEarlierVisitorDays(nextMorning);

    const days = (await db.select({ day: visitorHashes.day }).from(visitorHashes)).map(row => row.day);
    const secretDays = (await db.select({ day: visitorSecrets.day }).from(visitorSecrets)).map(row => row.day);
    expect(days).toEqual(["2026-10-23"]);
    expect(secretDays).toEqual(["2026-10-23"]);
    expect(await getVisitorCount()).toBe(2);
  });
});
