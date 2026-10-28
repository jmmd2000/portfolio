import { eq, sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { plum, plumCooldowns } from "$lib/server/db/schema";
import { cooldownSeconds, fullFrom, plumActions, type PlumAction } from "$lib/plum/plumRules";
import { sleepState, wokenUpMilliseconds } from "$lib/plum/plumSleep";
import type { ActionOutcome, ActionResult, CooldownsLeft, PlumState } from "$lib/schemas/plumState";
import { ensurePlum, getPlum } from "./plum";
import { getThrowCount } from "./throws";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Thrown inside an action's transaction to undo it, so a refused action doesn't use up the cooldown */
class RefusedAction extends Error {
  constructor(readonly outcome: "full" | "asleep") {
    super(`Plum refused: ${outcome}`);
  }
}

export async function getPlumState(now: Date): Promise<PlumState> {
  const { awakeUntil, lastFedAt, ...stats } = await getPlum();
  // Counted by the server, so a visitor's wrong clock can't change the answer
  const lastFedSecondsAgo = lastFedAt ? Math.max(0, Math.floor((now.getTime() - lastFedAt.getTime()) / 1000)) : null;
  return { stats, cooldowns: await getCooldownsLeft(now), ...sleepState(stats.energy, awakeUntil, now), lastFedSecondsAgo, throws: await getThrowCount() };
}

async function getCooldownsLeft(now: Date): Promise<CooldownsLeft> {
  const rows = await db.select({ action: plumCooldowns.action, readyAt: plumCooldowns.readyAt }).from(plumCooldowns);
  const cooldowns: CooldownsLeft = { feed: 0, pet: 0, play: 0 };

  for (const action of plumActions) {
    const row = rows.find(row => row.action === action);
    if (!row) continue;
    cooldowns[action] = Math.max(0, Math.ceil((row.readyAt.getTime() - now.getTime()) / 1000));
  }
  return cooldowns;
}

/**
 * Does an action for one visitor. It claims the action's cooldown first, so of any visitors acting at the same
 * moment, only one gets "done" and the rest get "cooling". If she refuses, the claim is undone with the rest of
 * the transaction. Returns the outcome and how she is afterwards.
 */
export async function act(action: PlumAction, now: Date): Promise<ActionResult> {
  await ensurePlum();

  let outcome: ActionOutcome;
  try {
    outcome = await db.transaction(async transaction => {
      const claimed = await claimCooldown(transaction, action, now);
      if (!claimed) return "cooling";

      return await changeStats(transaction, action, now);
    });
  } catch (error) {
    if (!(error instanceof RefusedAction)) throw error;
    outcome = error.outcome;
  }

  return { outcome, ...(await getPlumState(now)) };
}

/**
 * Starts the action's cooldown, unless it's already running. Two claims at the same moment can't both win: the
 * second waits for the first, then finds the cooldown running.
 */
async function claimCooldown(transaction: Transaction, action: PlumAction, now: Date): Promise<boolean> {
  const readyAt = new Date(now.getTime() + cooldownSeconds[action] * 1000);
  const claimed = await transaction
    .insert(plumCooldowns)
    .values({ action, readyAt })
    .onConflictDoUpdate({ target: plumCooldowns.action, set: { readyAt }, setWhere: sql`${plumCooldowns.readyAt} <= ${now.toISOString()}::timestamptz` })
    .returning({ action: plumCooldowns.action });

  return claimed.length > 0;
}

/**
 * Changes her stats for the action, each in one update kept between 0 and 100. Her row is locked first, so
 * whether she's asleep or full can't change before the update. Feeding is refused while she's asleep or full,
 * by throwing RefusedAction. Playing while she's asleep wakes her for an hour. Petting her never wakes her.
 */
async function changeStats(transaction: Transaction, action: PlumAction, now: Date): Promise<"done" | "woke"> {
  const [current] = await transaction.select({ food: plum.food, energy: plum.energy, awakeUntil: plum.awakeUntil }).from(plum).for("update");
  if (!current) throw new Error("Plum's row is missing");
  const { sleep } = sleepState(current.energy, current.awakeUntil, now);

  if (action === "feed") {
    if (sleep) throw new RefusedAction("asleep");
    if (current.food >= fullFrom) throw new RefusedAction("full");

    await transaction
      .update(plum)
      .set({ food: sql`least(100, ${plum.food} + 45)`, lastFedAt: now })
      .where(eq(plum.id, 1));
    return "done";
  }

  if (action === "pet") {
    await transaction
      .update(plum)
      .set({ happiness: sql`least(100, ${plum.happiness} + 15)` })
      .where(eq(plum.id, 1));
    return "done";
  }

  const awakeUntil = sleep ? new Date(now.getTime() + wokenUpMilliseconds) : current.awakeUntil;
  await transaction
    .update(plum)
    .set({ happiness: sql`least(100, ${plum.happiness} + 25)`, energy: sql`greatest(0, ${plum.energy} - 20)`, awakeUntil })
    .where(eq(plum.id, 1));
  return sleep ? "woke" : "done";
}
