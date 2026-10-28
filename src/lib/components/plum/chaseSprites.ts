import ball from "$lib/assets/plum/ball.png";
import jump from "$lib/assets/plum/jump.png";
import pounce from "$lib/assets/plum/pounce.png";
import run from "$lib/assets/plum/run.png";
import sit from "$lib/assets/plum/sit.png";
import walk from "$lib/assets/plum/walk.png";
import type { SpriteSheet } from "./penSprites";

export type ChaseSprite = "run" | "walk" | "jump" | "pounce" | "sit";

function sheet(src: string, durations: number[]): SpriteSheet {
  return { src, frameWidth: 40, frameHeight: 32, durations };
}

/** Plum side on and facing right, for when she's out of her pen. She's mirrored to face left */
export const chaseSprites: Record<ChaseSprite, SpriteSheet> = {
  run: sheet(run, Array(8).fill(70)),
  walk: sheet(walk, Array(8).fill(110)),
  jump: sheet(jump, [140, 90, 120, 100, 180]),
  pounce: sheet(pounce, [240, 240, 90, 320]),
  sit: sheet(sit, [1400, 260]),
};

/** The ball, its seam turning a little in each frame. The site picks the frame from how far it has rolled */
export const ballSheet: SpriteSheet = { src: ball, frameWidth: 8, frameHeight: 8, durations: Array(6).fill(0) };

/** How many sprite pixels the ball rolls before it shows its next frame */
export const ballPixelsPerFrame = 2;
