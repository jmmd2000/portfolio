import { z } from "zod";
import { plumActions } from "$lib/plum/plumRules";

const stat = z.number().int().min(0).max(100);
const secondsLeft = z.number().int().min(0);

const sleepReason = z.enum(["night", "nap"]).nullable();

/**
 * What every visitor sees of Plum: her stats, the seconds left on each action's cooldown (0 when it's ready), why
 * she's asleep (null when she's awake), and what someone woke her from (null unless she's only awake because of it).
 */
export const plumStateSchema = z.object({
  stats: z.object({ food: stat, happiness: stat, energy: stat }),
  cooldowns: z.object({ feed: secondsLeft, pet: secondsLeft, play: secondsLeft }),
  sleep: sleepReason,
  wokenFrom: sleepReason,
});

/**
 * What came of an action, and how she is afterwards. She refuses food when she's full or asleep. "woke" means
 * playing woke her up. "cooling" means someone did it within its cooldown.
 */
export const actionResultSchema = plumStateSchema.extend({
  outcome: z.enum(["done", "full", "asleep", "woke", "cooling"]),
});

export const actionRequestSchema = z.object({ action: z.enum(plumActions) });

export type PlumState = z.infer<typeof plumStateSchema>;
export type CooldownsLeft = PlumState["cooldowns"];
export type ActionResult = z.infer<typeof actionResultSchema>;
export type ActionOutcome = ActionResult["outcome"];
