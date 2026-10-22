import { cooldownSeconds, plumActions, type PlumAction } from "$lib/plum/plumRules";
import type { CooldownsLeft } from "$lib/schemas/plumState";

/** How long ago an action can be and still be shown. A little over the 10 seconds between checks */
const recentSeconds = 11;

/**
 * The actions someone else did since the page last heard from the server. A cooldown only starts when someone
 * acts, so a cooldown with more time left than the page expected means a new action. Actions from longer ago,
 * such as while the tab was in the background, are left out.
 *
 * @param expected the seconds the page thinks are left on each cooldown
 * @param latest the seconds the server says are left
 */
export function actionsByOthers(expected: CooldownsLeft, latest: CooldownsLeft): PlumAction[] {
  return plumActions.filter(action => {
    const startedSecondsAgo = cooldownSeconds[action] - latest[action];
    return latest[action] > expected[action] + 1 && startedSecondsAgo <= recentSeconds;
  });
}
