/** Plum's stats. Each runs from 0 to 100, and higher is better */
export interface PlumStats {
  food: number;
  happiness: number;
  energy: number;
}

export const plumActions = ["feed", "pet", "play"] as const;

export type PlumAction = (typeof plumActions)[number];

/** How long each action waits before anyone can do it again */
export const cooldownSeconds: Record<PlumAction, number> = { feed: 25, pet: 12, play: 35 };

/** She refuses food from this much food up */
export const fullFrom = 90;

/** Below this much energy she's asleep, and too tired to play */
export const asleepBelow = 25;

export function isPlumAction(value: unknown): value is PlumAction {
  return plumActions.some(action => action === value);
}
