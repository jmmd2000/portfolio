import asleep from "$lib/assets/plum/asleep.png";
import eating from "$lib/assets/plum/eating.png";
import full from "$lib/assets/plum/full.png";
import hungry from "$lib/assets/plum/hungry.png";
import blink from "$lib/assets/plum/idle-blink.png";
import earTwitch from "$lib/assets/plum/idle-ear.png";
import pawLick from "$lib/assets/plum/idle-lick.png";
import tailFlick from "$lib/assets/plum/idle-tail.png";
import idle from "$lib/assets/plum/idle.png";
import playing from "$lib/assets/plum/playing.png";
import purring from "$lib/assets/plum/purring.png";
import watchingBlink from "$lib/assets/plum/watching-blink.png";
import watching from "$lib/assets/plum/watching.png";

/** A sprite sheet: its frames side by side in one image, each shown for its own number of milliseconds */
export interface SpriteSheet {
  src: string;
  frameWidth: number;
  frameHeight: number;
  durations: number[];
}

export type PenSprite = "idle" | "watching" | "eating" | "purring" | "playing" | "hungry" | "full" | "asleep" | "blink" | "watchingBlink" | IdleAnimation;

/** The short animations she plays now and then while idle. Each ends on her still idle pose */
export const idleAnimations = ["earTwitch", "tailFlick", "pawLick"] as const;

export type IdleAnimation = (typeof idleAnimations)[number];

function sheet(src: string, durations: number[]): SpriteSheet {
  return { src, frameWidth: 32, frameHeight: 32, durations };
}

/** Plum facing the visitor in her pen */
export const penSprites: Record<PenSprite, SpriteSheet> = {
  idle: sheet(idle, [1000]),
  // One frame per way she can look, in the order of `gazeDirections`. The site picks one, so they never play in turn
  watching: sheet(watching, Array(9).fill(1000)),
  // Her eyes half shut, then shut, for each way she looks in turn. The site picks the frame
  watchingBlink: sheet(watchingBlink, Array(18).fill(100)),
  eating: sheet(eating, [260, 260, 260]),
  purring: sheet(purring, [240, 240, 240]),
  playing: sheet(playing, [200, 160, 200, 260]),
  hungry: sheet(hungry, [1000]),
  full: sheet(full, [1000]),
  // Breathing out, then in
  asleep: sheet(asleep, [1600, 1600]),
  // Her eyes half shut, shut, half shut, then open. The site picks the frame
  blink: sheet(blink, [70, 110, 70, 100]),
  earTwitch: sheet(earTwitch, [120, 100, 160, 100]),
  tailFlick: sheet(tailFlick, [120, 160, 140, 100]),
  pawLick: sheet(pawLick, [200, 200, 260, 180, 260, 180, 260, 200, 200, 100]),
};
