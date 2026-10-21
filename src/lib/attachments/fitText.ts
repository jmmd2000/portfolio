import type { Attachment } from "svelte/attachments";

const measureSize = 100;

/** The gap between parts in em. It matches the gap on `.fitted-line` in app.css. */
const partGap = 0.22;

/** Keeps 1% of the width spare, so rounding never pushes the text past the edge */
const spareWidth = 0.99;

/**
 * Returns the font size in px that makes text fill `availableWidth`, but never more than `maxSize`.
 * `measuredWidth` is the width of the text at 100px. Text with no width gets `maxSize`.
 */
export function fittedFontSize(availableWidth: number, measuredWidth: number, maxSize: number): number {
  const size = Math.floor((availableWidth / measuredWidth) * measureSize * spareWidth);
  return Math.min(size, maxSize);
}

function measureText(element: HTMLElement, text: string): number {
  const measure = document.createElement("span");
  measure.style.cssText = `position: absolute; visibility: hidden; white-space: nowrap; font-size: ${measureSize}px;`;
  measure.textContent = text;
  element.append(measure);
  const width = measure.getBoundingClientRect().width;
  measure.remove();
  return width;
}

function rootFontSize(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function partsAreStacked(element: HTMLElement): boolean {
  return getComputedStyle(element).flexDirection === "column";
}

function fit(element: HTMLElement, maxRem: number): void {
  const availableWidth = element.clientWidth;
  if (availableWidth === 0) return;

  const maxSize = maxRem * rootFontSize();
  const parts = Array.from(element.querySelectorAll<HTMLElement>(":scope > .part"));

  if (parts.length > 1 && partsAreStacked(element)) {
    element.style.fontSize = "";
    for (const part of parts) {
      const size = fittedFontSize(availableWidth, measureText(element, part.textContent), maxSize);
      part.style.fontSize = `${size}px`;
    }
    return;
  }

  for (const part of parts) {
    part.style.fontSize = "";
  }

  const texts = parts.length > 0 ? parts.map(part => part.textContent) : [element.textContent];
  let lineWidth = (texts.length - 1) * partGap * measureSize;
  for (const text of texts) {
    lineWidth += measureText(element, text);
  }
  element.style.fontSize = `${fittedFontSize(availableWidth, lineWidth, maxSize)}px`;
}

/**
 * Sizes a `.fitted-line` element so its text fills its width, up to `maxRem`. Put each word that can go on its own
 * line in a `.part` span. When the CSS stacks the parts on narrow screens, each part fills the width by itself.
 * It refits when the width changes and once the fonts load.
 */
export function fitText(maxRem: number): Attachment<HTMLElement> {
  return element => {
    let attached = true;
    let lastWidth = -1;

    // Only a change of width needs a refit. A refit changes the height, so a refit on any resize would loop.
    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (width === lastWidth) return;

      lastWidth = width;
      fit(element, maxRem);
    });
    observer.observe(element);

    void document.fonts.ready.then(() => {
      if (attached) fit(element, maxRem);
    });

    return () => {
      attached = false;
      observer.disconnect();
    };
  };
}
