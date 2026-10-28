import { describe, expect, it } from "vitest";
import { ballFrame, ballRadius, isResting, isThrow, stepBall, stepsFor, throwVelocity, type Ball } from "./ballPhysics";

const playground = { width: 1000, height: 600, pixel: 4 };
const floor = playground.height - ballRadius(playground);

function runSteps(ball: Ball, steps: number): Ball {
  let moved = ball;
  for (let step = 0; step < steps; step++) moved = stepBall(moved, playground);
  return moved;
}

describe("stepsFor", () => {
  it("runs whole steps of 1/120 of a second and carries the rest to the next frame", () => {
    const { steps, leftOver } = stepsFor(1 / 60 + 0.001, 0);

    expect(steps).toBe(2);
    expect(leftOver).toBeCloseTo(0.001);
  });

  it("counts a long frame, such as a tab coming back, as a tenth of a second", () => {
    expect(stepsFor(30, 0).steps).toBe(12);
  });
});

describe("stepBall", () => {
  it("falls, bounces lower each time, and comes to rest on the bottom", () => {
    const dropped = runSteps({ x: 500, y: 100, velocityX: 0, velocityY: 0 }, 1200);

    expect(dropped.y).toBe(floor);
    expect(isResting(dropped, playground)).toBe(true);
  });

  it("bounces back off a side with less speed", () => {
    const thrown = runSteps({ x: 980, y: 300, velocityX: 2000, velocityY: 0 }, 5);

    expect(thrown.velocityX).toBeLessThan(0);
    expect(Math.abs(thrown.velocityX)).toBeLessThan(2000);
    expect(thrown.x).toBeLessThanOrEqual(playground.width - ballRadius(playground));
  });

  it("slows down while rolling along the bottom until it stops", () => {
    const rolled = runSteps({ x: 100, y: floor, velocityX: 500, velocityY: 0 }, 600);

    expect(rolled.velocityX).toBe(0);
    expect(rolled.x).toBeGreaterThan(100);
  });
});

describe("throwVelocity", () => {
  it("uses only the pointer's last 100 milliseconds", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 0, y: 0, time: 900 },
      { x: 50, y: -20, time: 1000 },
    ];

    expect(throwVelocity(samples)).toEqual({ velocityX: 500, velocityY: -200 });
  });

  it("caps the speed of a flick but keeps its direction", () => {
    const { velocityX, velocityY } = throwVelocity([
      { x: 0, y: 0, time: 0 },
      { x: 3000, y: 4000, time: 100 },
    ]);

    expect(Math.hypot(velocityX, velocityY)).toBeCloseTo(2600);
    expect(velocityY / velocityX).toBeCloseTo(4 / 3);
  });

  it("gives no speed when the samples share one moment", () => {
    expect(
      throwVelocity([
        { x: 0, y: 0, time: 5 },
        { x: 40, y: 0, time: 5 },
      ])
    ).toEqual({ velocityX: 0, velocityY: 0 });
  });
});

describe("isThrow", () => {
  it("counts a fast release as a throw and a slow one as a drop", () => {
    expect(isThrow({ velocityX: 300, velocityY: 0 })).toBe(true);
    expect(isThrow({ velocityX: 200, velocityY: 100 })).toBe(false);
  });
});

describe("ballFrame", () => {
  it("steps through the frames as the ball rolls, backwards when it rolls left, and wraps round", () => {
    const step = 2 * playground.pixel;

    expect(ballFrame(0, playground)).toBe(0);
    expect(ballFrame(step, playground)).toBe(1);
    expect(ballFrame(6 * step, playground)).toBe(0);
    expect(ballFrame(-step, playground)).toBe(5);
  });
});
