import { ballPixelsPerFrame, ballSheet } from "./chaseSprites";

/** The ball's centre and speed, in CSS pixels and CSS pixels a second. Screen y grows downwards */
export interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

export interface Velocity {
  velocityX: number;
  velocityY: number;
}

/** The window she plays in. `pixel` is the size of one sprite pixel in CSS pixels */
export interface Playground {
  width: number;
  height: number;
  pixel: number;
}

/** Where the pointer was at a moment, in milliseconds, while it held the ball */
export interface PointerSample {
  x: number;
  y: number;
  time: number;
}

/** Every step of the physics is this many seconds long, so it runs the same at any frame rate */
export const stepSeconds = 1 / 120;

/** A frame longer than this only counts this long, so a slow frame or a tab coming back can't make anything jump */
const longestFrameSeconds = 0.1;

const gravity = 2400;
/** The share of its speed the ball keeps when it hits an edge */
const bounce = 0.55;
/** How much of its speed the rolling ball loses each second */
const rollingFriction = 1.5;
/** Below this speed a bounce or a roll stops */
const settleSpeed = 60;
const fastestThrow = 2600;
/** A release slower than this is a drop, not a throw */
const slowestThrow = 300;
/** Throw speed comes from the pointer's movement over this many milliseconds before the release */
const throwSampleMilliseconds = 100;

/** The ball's radius in CSS pixels. Its sprite is 8 sprite pixels across */
export function ballRadius(playground: Playground): number {
  return (ballSheet.frameWidth / 2) * playground.pixel;
}

/**
 * Splits a frame's time into whole physics steps. Returns how many steps to run now and the time left over, which
 * the next frame adds to its own.
 */
export function stepsFor(frameSeconds: number, leftOver: number): { steps: number; leftOver: number } {
  const time = Math.min(frameSeconds, longestFrameSeconds) + leftOver;
  const steps = Math.floor(time / stepSeconds);
  return { steps, leftOver: time - steps * stepSeconds };
}

/**
 * Moves the ball on by one step. Gravity pulls it down, it bounces off the four edges of the playground with some
 * of its speed lost, and it slows down while it rolls along the bottom until it stops.
 */
export function stepBall(ball: Ball, playground: Playground): Ball {
  const radius = ballRadius(playground);
  const floor = playground.height - radius;
  let velocityX = ball.velocityX;
  let velocityY = ball.velocityY + gravity * stepSeconds;
  let x = ball.x + velocityX * stepSeconds;
  let y = ball.y + velocityY * stepSeconds;

  if (x < radius) {
    x = radius;
    velocityX = Math.abs(velocityX) * bounce;
  }
  if (x > playground.width - radius) {
    x = playground.width - radius;
    velocityX = -Math.abs(velocityX) * bounce;
  }
  if (y < radius) {
    y = radius;
    velocityY = Math.abs(velocityY) * bounce;
  }
  if (y >= floor) {
    y = floor;
    velocityY = -Math.abs(velocityY) * bounce;
    if (Math.abs(velocityY) < settleSpeed) velocityY = 0;
    velocityX *= 1 - rollingFriction * stepSeconds;
    if (Math.abs(velocityX) < settleSpeed) velocityX = 0;
  }

  return { x, y, velocityX, velocityY };
}

/** Whether the ball is lying still on the bottom of the playground */
export function isResting(ball: Ball, playground: Playground): boolean {
  return ball.velocityX === 0 && ball.velocityY === 0 && ball.y >= playground.height - ballRadius(playground);
}

/**
 * The speed the ball leaves the pointer at: how far the pointer moved over its last 100 milliseconds, capped so a
 * flick can't send the ball through the edges. Samples must be oldest first.
 */
export function throwVelocity(samples: PointerSample[]): Velocity {
  const last = samples.at(-1);
  if (!last) return { velocityX: 0, velocityY: 0 };

  const first = samples.find(sample => last.time - sample.time <= throwSampleMilliseconds) ?? last;
  const seconds = (last.time - first.time) / 1000;
  if (seconds <= 0) return { velocityX: 0, velocityY: 0 };

  const velocityX = (last.x - first.x) / seconds;
  const velocityY = (last.y - first.y) / seconds;
  const speed = Math.hypot(velocityX, velocityY);
  if (speed <= fastestThrow) return { velocityX, velocityY };

  return { velocityX: (velocityX / speed) * fastestThrow, velocityY: (velocityY / speed) * fastestThrow };
}

/** Whether a release was fast enough to count as a throw */
export function isThrow({ velocityX, velocityY }: Velocity): boolean {
  return Math.hypot(velocityX, velocityY) >= slowestThrow;
}

/** The ball's frame for where it is across the playground, so it rolls forwards going right and backwards going left */
export function ballFrame(x: number, playground: Playground): number {
  const frameCount = ballSheet.durations.length;
  const step = Math.floor(x / (ballPixelsPerFrame * playground.pixel));
  return ((step % frameCount) + frameCount) % frameCount;
}
