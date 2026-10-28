/**
 * The frame of a sprite sheet to show `elapsed` milliseconds after it started. A looping sheet starts again after
 * its last frame. A sheet that doesn't loop stays on its last frame.
 */
export function frameAt(durations: number[], elapsed: number, loop: boolean): number {
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  if (total <= 0) return 0;

  let timeLeft = loop ? elapsed % total : Math.min(elapsed, total);
  for (const [index, duration] of durations.entries()) {
    timeLeft -= duration;
    if (timeLeft < 0) return index;
  }
  return durations.length - 1;
}
