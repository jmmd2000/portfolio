import { asleepBelow, type PlumStats } from "./plumRules";

export type StatWord = "Great" | "Good" | "Okay" | "Low" | "Critical";

/** She looks hungry below this much food */
const hungryBelow = 40;

export function statWord(value: number): StatWord {
  if (value >= 80) return "Great";
  if (value >= 60) return "Good";
  if (value >= 40) return "Okay";
  if (value >= 20) return "Low";
  return "Critical";
}

export function isAsleep(stats: PlumStats): boolean {
  return stats.energy < asleepBelow;
}

/** The sprite she shows when nothing is happening */
export function restingSprite(stats: PlumStats): "asleep" | "hungry" | "idle" {
  if (isAsleep(stats)) return "asleep";
  if (stats.food < hungryBelow) return "hungry";
  return "idle";
}

/** One line on how she is, shown above her stats */
export function moodLine(stats: PlumStats): string {
  if (isAsleep(stats)) return "She's asleep";
  if (stats.food < hungryBelow) return "She's getting hungry";
  if (stats.happiness >= 80) return "She's very happy";
  return "She's content";
}
