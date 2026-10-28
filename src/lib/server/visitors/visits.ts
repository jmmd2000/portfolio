import { createHmac, randomBytes } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { isbot } from "isbot";
import { db } from "$lib/server/db";
import { counters, visitorHashes, visitorSecrets } from "$lib/server/db/schema";
import { reportServerError } from "$lib/server/errorReporting";
import { irishDate } from "./irishDate";
import { visitorAddress } from "./visitorAddress";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const counterName = "visitors";
const cleanupIntervalMilliseconds = 60_000;

/** A page view, as the visitor count sees it */
export interface Visit {
  /** The IP address the proxy reports */
  address: string;
  userAgent: string | null;
  signedIn: boolean;
  at: Date;
}

/**
 * Adds one to the visitor count the first time someone visits on an Irish date. The server knows a repeat visit
 * by an HMAC of the visitor's IP, made with that date's secret. Visits while signed in to the admin, and visits
 * from known crawlers, don't count.
 */
export async function countVisit({ address, userAgent, signedIn, at }: Visit): Promise<void> {
  if (signedIn || isbot(userAgent)) return;

  const day = irishDate(at);
  await db.transaction(async transaction => {
    const secret = await secretForDay(transaction, day);
    const hash = createHmac("sha256", secret).update(visitorAddress(address)).digest("hex");

    const newVisitors = await transaction.insert(visitorHashes).values({ day, hash }).onConflictDoNothing().returning();
    if (newVisitors.length === 0) return;

    await transaction
      .insert(counters)
      .values({ name: counterName, count: 1 })
      .onConflictDoUpdate({ target: counters.name, set: { count: sql`${counters.count} + 1` } });
  });
}

/** The date's secret, made the first time it's needed */
async function secretForDay(transaction: Transaction, day: string): Promise<string> {
  // When two first visits of the day arrive together, one insert wins and the other waits for it, then skips.
  // Both then read the winner's secret, so the same IP never gets two different hashes.
  await transaction
    .insert(visitorSecrets)
    .values({ day, secret: randomBytes(32).toString("hex") })
    .onConflictDoNothing();

  const [row] = await transaction.select({ secret: visitorSecrets.secret }).from(visitorSecrets).where(eq(visitorSecrets.day, day));
  if (!row) throw new Error(`The visitor secret for ${day} is missing`);

  return row.secret;
}

export async function getVisitorCount(): Promise<number> {
  const [row] = await db.select({ count: counters.count }).from(counters).where(eq(counters.name, counterName));
  return row?.count ?? 0;
}

/**
 * Deletes the secrets and hashes of every date before the Irish date of `now`. The hashes could be matched to IPs
 * by anyone holding the same day's secret, so neither is kept once the day is over.
 */
export async function deleteEarlierVisitorDays(now: Date): Promise<void> {
  const today = irishDate(now);
  await db.transaction(async transaction => {
    await transaction.delete(visitorHashes).where(lt(visitorHashes.day, today));
    await transaction.delete(visitorSecrets).where(lt(visitorSecrets.day, today));
  });
}

/** Deletes earlier days' secrets and hashes now and then once a minute, so they go soon after midnight even when nobody visits */
export function startVisitorCleanup(): void {
  void cleanUpVisitorDays();
  setInterval(() => void cleanUpVisitorDays(), cleanupIntervalMilliseconds).unref();
}

async function cleanUpVisitorDays(): Promise<void> {
  try {
    await deleteEarlierVisitorDays(new Date());
  } catch (error) {
    console.error("Couldn't delete earlier days' visitor data:", error);
    reportServerError(error, { job: "visitor-cleanup" });
  }
}
