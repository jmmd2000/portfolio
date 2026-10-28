/** Where she can look, in the order of the watching sprite's frames */
export const gazeDirections = ["ahead", "look_up", "look_up_right", "look_right", "look_down_right", "look_down", "look_down_left", "look_left", "look_up_left"] as const;

export type GazeDirection = (typeof gazeDirections)[number];

/** The eight directions around her, clockwise from the right, each covering 45 degrees */
const around: GazeDirection[] = ["look_right", "look_down_right", "look_down", "look_down_left", "look_left", "look_up_left", "look_up", "look_up_right"];

/**
 * Which way she looks at a pointer `dx` and `dy` pixels from her face. Screen y grows downwards. Within
 * `aheadRadius` of her face she looks straight ahead.
 */
export function gazeAt(dx: number, dy: number, aheadRadius: number): GazeDirection {
  if (Math.hypot(dx, dy) < aheadRadius) return "ahead";

  const degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
  const sector = Math.round(degrees / 45);
  return around[(sector + 8) % 8] ?? "ahead";
}

/** The watching sprite's frame for a direction */
export function gazeFrame(direction: GazeDirection): number {
  return gazeDirections.indexOf(direction);
}
