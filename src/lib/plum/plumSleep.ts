import { asleepBelow } from "./plumRules";

/** Why she's asleep: it's night in Ireland, or she's too tired and napping */
export type SleepReason = "night" | "nap";

/** She sleeps from 23:00 up to 07:00, Irish time */
const nightStartHour = 23;
const nightEndHour = 7;

/** How long playing with her keeps her awake when she was asleep */
export const wokenUpMilliseconds = 60 * 60 * 1000;

const hourFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Dublin" });

export function irishHour(date: Date): number {
  return Number(hourFormat.format(date));
}

export function isNight(date: Date): boolean {
  const hour = irishHour(date);
  return hour >= nightStartHour || hour < nightEndHour;
}

/** Why she'd be asleep now if nobody had woken her, or null if she'd be awake */
export function naturalSleep(energy: number, now: Date): SleepReason | null {
  if (isNight(now)) return "night";
  if (energy < asleepBelow) return "nap";
  return null;
}

/**
 * Whether she's asleep, and whether someone woke her. Playing with her while she's asleep keeps her awake until
 * `awakeUntil`, whatever the time or her energy.
 */
export function sleepState(energy: number, awakeUntil: Date | null, now: Date): { sleep: SleepReason | null; wokenFrom: SleepReason | null } {
  const natural = naturalSleep(energy, now);
  const keptAwake = awakeUntil !== null && awakeUntil > now;
  if (keptAwake) return { sleep: null, wokenFrom: natural };
  return { sleep: natural, wokenFrom: null };
}
