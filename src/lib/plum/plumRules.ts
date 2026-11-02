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

/** She refuses food once her food is this high */
export const fullAt = 100;

/** Below this much food she's hungry. Asleep, she still wakes up to be fed */
export const hungryBelow = 40;

/** Below this much energy she naps */
export const asleepBelow = 25;
