import asleep from "$lib/assets/plum/asleep.png";
import eating from "$lib/assets/plum/eating.png";
import full from "$lib/assets/plum/full.png";
import hungry from "$lib/assets/plum/hungry.png";
import idle from "$lib/assets/plum/idle.png";
import playing from "$lib/assets/plum/playing.png";
import purring from "$lib/assets/plum/purring.png";
import watching from "$lib/assets/plum/watching.png";

/** A sprite sheet: its frames side by side in one image, each shown for its own number of milliseconds */
export interface SpriteSheet {
  src: string;
  frameWidth: number;
  frameHeight: number;
  durations: number[];
}

export type PenSprite = "idle" | "watching" | "eating" | "purring" | "playing" | "hungry" | "full" | "asleep";

function sheet(src: string, durations: number[]): SpriteSheet {
  return { src, frameWidth: 32, frameHeight: 32, durations };
}

/** Plum facing the visitor in her pen */
export const penSprites: Record<PenSprite, SpriteSheet> = {
  idle: sheet(idle, [1000]),
  // One frame per way she can look, in the order of `gazeDirections`. The site picks one, so they never play in turn
  watching: sheet(watching, Array(9).fill(1000)),
  eating: sheet(eating, [260, 260, 260]),
  purring: sheet(purring, [240, 240, 240]),
  playing: sheet(playing, [200, 160, 200, 260]),
  hungry: sheet(hungry, [1000]),
  full: sheet(full, [1000]),
  asleep: sheet(asleep, [1000]),
};
