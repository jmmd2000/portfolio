import type { PlumState } from "$lib/schemas/plumState";

export type StatWord = "Great" | "Good" | "Okay" | "Low" | "Critical";

const hungryBelow = 40;

export function statWord(value: number): StatWord {
  if (value >= 80) return "Great";
  if (value >= 60) return "Good";
  if (value >= 40) return "Okay";
  if (value >= 20) return "Low";
  return "Critical";
}

export function isHungry(state: Pick<PlumState, "stats">): boolean {
  return state.stats.food < hungryBelow;
}

/** The sprite she shows when nothing is happening */
export function restingSprite(state: Pick<PlumState, "stats" | "sleep">): "asleep" | "hungry" | "idle" {
  if (state.sleep) return "asleep";
  if (isHungry(state)) return "hungry";
  return "idle";
}

/** One line on how she is, shown above her stats */
export function moodLine(state: Pick<PlumState, "stats" | "sleep" | "wokenFrom">): string {
  if (state.sleep === "night") return "She's asleep for the night";
  if (state.sleep === "nap") return "She's having a nap";
  if (state.wokenFrom === "night") return "She's up past her bedtime";
  if (state.wokenFrom === "nap") return "She's awake, just about";
  if (isHungry(state)) return "She's getting hungry";
  if (state.stats.happiness >= 80) return "She's very happy";
  return "She's content";
}
