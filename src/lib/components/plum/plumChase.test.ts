import { describe, expect, it } from "vitest";
import { ballRadius, stepSeconds } from "./ballPhysics";
import { callBack, letOut, stepChase, type Chase } from "./plumChase";

const playground = { width: 1200, height: 700, pixel: 4 };
const floor = playground.height - ballRadius(playground);

function runFor(chase: Chase, seconds: number): Chase {
  let moved = chase;
  for (let step = 0; step < Math.round(seconds / stepSeconds); step++) moved = stepChase(moved, playground);
  return moved;
}

describe("letOut", () => {
  it("jumps out under the pen, with the ball lying on the bottom towards the middle of the window", () => {
    const chase = letOut(200, playground);

    expect(chase.plum).toMatchObject({ phase: "jumpingOut", x: 200, facing: "right" });
    expect(chase.ball.x).toBeGreaterThan(200);
    expect(chase.ball.y).toBe(floor);
  });

  it("keeps her inside the window when the pen is off to one side", () => {
    expect(letOut(-500, playground).plum.x).toBeGreaterThan(0);
  });
});

describe("stepChase", () => {
  it("runs to the ball after jumping out, pounces on it, then sits by it", () => {
    const chase = letOut(200, playground);

    expect(runFor(chase, 0.7).plum.phase).toBe("running");
    const caught = runFor(chase, 3);

    expect(caught.plum.phase).toBe("sitting");
    expect(Math.abs(caught.ball.x - caught.plum.x)).toBeLessThanOrEqual(14 * playground.pixel);
  });

  it("chases the ball again when it's thrown, facing the way she runs", () => {
    const sitting = runFor(letOut(200, playground), 3);

    const thrown = runFor({ ...sitting, ball: { ...sitting.ball, velocityX: -1500, velocityY: -800 } }, 0.2);

    expect(thrown.plum.phase).toBe("running");
    expect(thrown.plum.facing).toBe("left");
  });

  it("stops the ball the moment she pounces on it", () => {
    const chase = letOut(200, playground);
    let before: Chase = { ...chase, ball: { ...chase.ball, x: 1100, velocityX: -900 } };
    let after = stepChase(before, playground);
    while (after.plum.phase !== "pouncing") {
      before = after;
      after = stepChase(before, playground);
    }

    expect(before.ball.velocityX).not.toBe(0);
    expect(after.ball.velocityX).toBe(0);
  });

  it("sits and waits while the visitor holds the ball", () => {
    const running = runFor(letOut(200, playground), 0.8);

    const waiting = runFor({ ...running, ballHeld: true, ball: { x: 1000, y: 100, velocityX: 0, velocityY: 0 } }, 1);

    expect(waiting.plum.phase).toBe("sitting");
    expect(waiting.ball).toEqual({ x: 1000, y: 100, velocityX: 0, velocityY: 0 });
  });
});

describe("callBack", () => {
  it("walks her back under the pen, where she jumps in and is home", () => {
    const sitting = runFor(letOut(200, playground), 3);

    const walking = runFor(callBack(sitting, 900, playground), 0.5);
    expect(walking.plum).toMatchObject({ phase: "walkingBack", facing: "right" });

    const home = runFor(walking, 6);
    expect(home.plum).toMatchObject({ phase: "home", x: 900 });
  });
});
