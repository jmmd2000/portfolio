import { sql } from "drizzle-orm";
import { db } from "$lib/server/db";
import { plum, plumCooldowns } from "$lib/server/db/schema";
import { asleepBelow, cooldownSeconds, fullFrom, plumActions, type PlumAction } from "$lib/plum/plumRules";
import { ensurePlum, getPlum, type PlumStats } from "./plum";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The seconds left on each action's cooldown. 0 means anyone can do it now */
export type CooldownsLeft = Record<PlumAction, number>;

/** What every visitor sees of Plum */
export interface PlumState {
  stats: PlumStats;
  cooldowns: CooldownsLeft;
}

/**
 * What came of an action. She refuses food when she's full and play when she's too tired. "cooling" means
 * someone did it within its cooldown.
 */
export type ActionOutcome = "done" | "full" | "tired" | "cooling";

export interface ActionResult extends PlumState {
  outcome: ActionOutcome;
}

/** Thrown inside an action's transaction to undo it, so a refused action doesn't use up the cooldown */
class RefusedAction extends Error {
  constructor(readonly outcome: "full" | "tired") {
    super(`Plum refused: ${outcome}`);
  }
}

export async function getPlumState(now: Date): Promise<PlumState> {
  return { stats: await getPlum(), cooldowns: await getCooldownsLeft(now) };
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

      await changeStats(transaction, action);
      return "done";
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

/** Changes her stats in one update, kept between 0 and 100. Throws RefusedAction if she's full or too tired */
async function changeStats(transaction: Transaction, action: PlumAction): Promise<void> {
  if (action === "feed") {
    const fed = await transaction
      .update(plum)
      .set({ food: sql`least(100, ${plum.food} + 45)` })
      .where(sql`${plum.food} < ${fullFrom}`)
      .returning({ id: plum.id });
    if (fed.length === 0) throw new RefusedAction("full");
    return;
  }

  if (action === "pet") {
    await transaction.update(plum).set({ happiness: sql`least(100, ${plum.happiness} + 15)` });
    return;
  }

  const played = await transaction
    .update(plum)
    .set({ happiness: sql`least(100, ${plum.happiness} + 25)`, energy: sql`greatest(0, ${plum.energy} - 20)` })
    .where(sql`${plum.energy} >= ${asleepBelow}`)
    .returning({ id: plum.id });
  if (played.length === 0) throw new RefusedAction("tired");
}
