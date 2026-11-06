import { ballRadius, type Ball, type Playground } from "./ballPhysics";

const storageKey = "plumBallThrown";
const plumHeightInSpritePixels = 32;
/** The space between the hint and the ball or Plum, in CSS pixels */
const gap = 14;
/** The closest the hint comes to the edge of the window, in CSS pixels */
const edgeSpace = 8;

export interface HintSize {
  width: number;
  height: number;
}

/** Where the hint goes. `side` says where it sits from the ball, and `notchX` is how far along the hint the ball is when it's above */
export interface HintPlace {
  x: number;
  y: number;
  side: "left" | "right" | "above";
  notchX: number;
}

/** Whether this browser has thrown her ball before. False when storage is blocked */
export function hasThrownBefore(): boolean {
  try {
    return localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

/** Saves that this browser has thrown her ball */
export function rememberThrow(): void {
  try {
    localStorage.setItem(storageKey, "true");
  } catch {
    // Without storage the hint shows again on the next visit
  }
}

/**
 * Places the hint beside the ball, on the far side from Plum so it doesn't cover her. When there's no room there,
 * it goes above her head, as near to the ball as the window allows.
 */
export function hintPlace(ball: Ball, plumX: number, size: HintSize, playground: Playground): HintPlace {
  const side = ball.x >= plumX ? "right" : "left";
  const reach = ballRadius(playground) + gap;
  const x = side === "right" ? ball.x + reach : ball.x - reach - size.width;
  const fits = x >= edgeSpace && x + size.width <= playground.width - edgeSpace;

  if (fits) {
    const y = Math.min(ball.y - size.height / 2, playground.height - size.height - edgeSpace);
    return { x, y, side, notchX: 0 };
  }

  const aboveX = Math.min(Math.max(ball.x - size.width / 2, edgeSpace), playground.width - size.width - edgeSpace);
  const aboveY = playground.height - plumHeightInSpritePixels * playground.pixel - gap - size.height;
  return { x: aboveX, y: aboveY, side: "above", notchX: ball.x - aboveX };
}
