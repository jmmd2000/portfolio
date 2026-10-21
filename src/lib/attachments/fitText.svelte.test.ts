import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { fitText } from "./fitText";
import "../../app.css";

let container: HTMLDivElement;
let line: HTMLHeadingElement;
let detach: (() => void) | void;

function nextFrame(): Promise<number> {
  return new Promise(resolve => requestAnimationFrame(resolve));
}

function partWidths(): number[] {
  return Array.from(line.children, part => part.getBoundingClientRect().width);
}

function lineWidth(): number {
  const parts = Array.from(line.children);
  return parts[parts.length - 1].getBoundingClientRect().right - parts[0].getBoundingClientRect().left;
}

// A font that loads during a test refits the line late and hides a missing refit
beforeAll(async () => {
  await document.fonts.load('900 100px "Big Shoulders Display Variable"');
});

beforeEach(() => {
  container = document.createElement("div");
  container.style.width = "600px";
  line = document.createElement("h1");
  line.className = "fitted-line";
  for (const word of ["James", "Doyle"]) {
    const part = document.createElement("span");
    part.className = "part";
    part.textContent = word;
    line.append(part);
  }
  container.append(line);
  document.body.append(container);
});

afterEach(() => {
  if (detach) detach();
  container.remove();
});

describe("fitText", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  it("fills the width of the line", async () => {
    detach = fitText(10)(line);

    await expect.poll(lineWidth).toBeGreaterThan(570);
    expect(lineWidth()).toBeLessThanOrEqual(600);
  });

  it("stops at the cap on a wide line", async () => {
    container.style.width = "3000px";
    detach = fitText(10)(line);

    await expect.poll(() => line.style.fontSize).toBe("160px");
  });

  it("refits when the width changes", async () => {
    detach = fitText(10)(line);
    await expect.poll(lineWidth).toBeGreaterThan(570);
    // Lets the observer report the first width, so the resize below is a change it sees
    await nextFrame();
    await nextFrame();

    container.style.width = "300px";

    await expect.poll(lineWidth).toBeLessThanOrEqual(300);
    expect(lineWidth()).toBeGreaterThan(285);
  });
});

describe("fitText on a narrow screen", () => {
  beforeEach(async () => {
    await page.viewport(400, 800);
  });

  it("fits each part to the width on its own line", async () => {
    container.style.width = "360px";
    detach = fitText(10)(line);

    await expect.poll(() => line.children[1].getAttribute("style")).toContain("font-size");
    for (const width of partWidths()) {
      expect(width).toBeGreaterThan(342);
      expect(width).toBeLessThanOrEqual(360);
    }
  });
});
