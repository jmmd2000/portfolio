import { ballRadius, isResting, stepBall, stepSeconds, type Ball, type Playground } from "./ballPhysics";
import { chaseSprites, type ChaseSprite } from "./chaseSprites";

/**
 * What she's doing while she's out: jumping out of her pen, running after the ball, pouncing on it, sitting by
 * it, walking back under her pen, jumping back in, and home once she's in.
 */
export type ChasePhase = "jumpingOut" | "running" | "pouncing" | "sitting" | "walkingBack" | "jumpingIn" | "home";

/** Plum on the bottom of the playground. `x` is the middle of her sprite, and `phaseSeconds` how long she's been in her phase */
export interface ChasingPlum {
  phase: ChasePhase;
  x: number;
  facing: "left" | "right";
  phaseSeconds: number;
  /** Where she walks back to, under her pen. Only set while she walks back */
  homeX: number | null;
}

/** Everything that moves while she's out. While the visitor holds the ball, it follows the pointer instead of the physics */
export interface Chase {
  plum: ChasingPlum;
  ball: Ball;
  ballHeld: boolean;
}

/** Her speeds, in sprite pixels a second */
const runSpeed = 140;
const walkSpeed = 45;
/** How close the ball has to be, in sprite pixels from her middle, for her to pounce on it */
const reach = 14;
/** How far the ball can roll from her, in sprite pixels, before she gets up and chases it again */
const sittingReach = 28;
/** The ball must be this close to the bottom, in sprite pixels, for her to pounce on it */
const pounceHeight = 6;

/** The sprite and whether it loops, for each phase */
export const phaseSprites: Record<ChasePhase, { name: ChaseSprite; loop: boolean }> = {
  jumpingOut: { name: "jump", loop: false },
  running: { name: "run", loop: true },
  pouncing: { name: "pounce", loop: false },
  sitting: { name: "sit", loop: true },
  walkingBack: { name: "walk", loop: true },
  jumpingIn: { name: "jump", loop: false },
  home: { name: "sit", loop: true },
};

function sheetSeconds(name: ChaseSprite): number {
  return chaseSprites[name].durations.reduce((total, duration) => total + duration, 0) / 1000;
}

function clampToPlayground(x: number, playground: Playground): number {
  const halfWidth = (chaseSprites.run.frameWidth / 2) * playground.pixel;
  return Math.min(Math.max(x, halfWidth), playground.width - halfWidth);
}

function inPhase(plum: ChasingPlum, phase: ChasePhase): ChasingPlum {
  return { ...plum, phase, phaseSeconds: 0 };
}

/**
 * Starts a chase with her jumping out at `penX`, the middle of her pen across the window. The ball lies on the
 * bottom a little way in front of her, towards the middle of the window.
 */
export function letOut(penX: number, playground: Playground): Chase {
  const x = clampToPlayground(penX, playground);
  const facing = x < playground.width / 2 ? "right" : "left";
  const ballOffset = 60 * playground.pixel * (facing === "right" ? 1 : -1);

  return {
    plum: { phase: "jumpingOut", x, facing, phaseSeconds: 0, homeX: null },
    ball: { x: x + ballOffset, y: playground.height - ballRadius(playground), velocityX: 0, velocityY: 0 },
    ballHeld: false,
  };
}

/** Sends her walking back to `penX`, the middle of her pen across the window, to jump back in */
export function callBack(chase: Chase, penX: number, playground: Playground): Chase {
  if (chase.plum.phase === "jumpingIn" || chase.plum.phase === "home") return chase;
  return { ...chase, plum: { ...inPhase(chase.plum, "walkingBack"), homeX: clampToPlayground(penX, playground) } };
}

/**
 * Moves her towards `target` at `speed` sprite pixels a second, facing the way she goes. Returns her new place and
 * whether she got there.
 */
function moveTowards(plum: ChasingPlum, target: number, speed: number, playground: Playground): { plum: ChasingPlum; arrived: boolean } {
  const distance = target - plum.x;
  const stride = speed * playground.pixel * stepSeconds;
  if (Math.abs(distance) <= stride) return { plum: { ...plum, x: target }, arrived: true };

  const facing = distance > 0 ? "right" : "left";
  return { plum: { ...plum, x: plum.x + Math.sign(distance) * stride, facing }, arrived: false };
}

function canPounce(plum: ChasingPlum, ball: Ball, playground: Playground): boolean {
  const closeEnough = Math.abs(ball.x - plum.x) <= reach * playground.pixel;
  const lowEnough = ball.y >= playground.height - ballRadius(playground) - pounceHeight * playground.pixel;
  const slowEnough = Math.abs(ball.velocityX) <= runSpeed * playground.pixel;
  return closeEnough && lowEnough && slowEnough;
}

function nextPlum(plum: ChasingPlum, ball: Ball, ballHeld: boolean, playground: Playground): { plum: ChasingPlum; caught: boolean } {
  const phaseDone = plum.phaseSeconds >= sheetSeconds(phaseSprites[plum.phase].name);

  switch (plum.phase) {
    case "jumpingOut":
      return { plum: phaseDone ? inPhase(plum, "running") : plum, caught: false };
    case "running": {
      if (ballHeld) return { plum: inPhase(plum, "sitting"), caught: false };
      if (canPounce(plum, ball, playground)) return { plum: inPhase(plum, "pouncing"), caught: true };
      return { plum: moveTowards(plum, clampToPlayground(ball.x, playground), runSpeed, playground).plum, caught: false };
    }
    case "pouncing":
      return { plum: phaseDone ? inPhase(plum, "sitting") : plum, caught: false };
    case "sitting": {
      const facing = ball.x < plum.x ? "left" : "right";
      const ballAway = Math.abs(ball.x - plum.x) > sittingReach * playground.pixel || !isResting(ball, playground);
      if (!ballHeld && ballAway) return { plum: inPhase({ ...plum, facing }, "running"), caught: false };
      return { plum: { ...plum, facing }, caught: false };
    }
    case "walkingBack": {
      const walked = moveTowards(plum, plum.homeX ?? plum.x, walkSpeed, playground);
      return { plum: walked.arrived ? inPhase(walked.plum, "jumpingIn") : walked.plum, caught: false };
    }
    case "jumpingIn":
      return { plum: phaseDone ? inPhase(plum, "home") : plum, caught: false };
    case "home":
      return { plum, caught: false };
  }
}

/**
 * Moves the chase on by one physics step. The ball moves unless it's held. She chases it, pounces on it once it's
 * low, slow and within her reach, which stops it, then sits by it until it's thrown again.
 */
export function stepChase(chase: Chase, playground: Playground): Chase {
  const ball = chase.ballHeld ? chase.ball : stepBall(chase.ball, playground);
  const aged = { ...chase.plum, phaseSeconds: chase.plum.phaseSeconds + stepSeconds };
  const { plum, caught } = nextPlum(aged, ball, chase.ballHeld, playground);

  return { plum, ball: caught ? { ...ball, velocityX: 0, velocityY: 0 } : ball, ballHeld: chase.ballHeld };
}
