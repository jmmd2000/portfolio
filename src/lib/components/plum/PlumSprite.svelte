<!--
  @component
  Plum drawn from a sprite sheet, every pixel a square of `--plum-scale` CSS pixels (6 unless the parent sets it).
  Keep the scale a whole number, so neighbouring frames never show at the edges. Without a `frame`, the frames
  play in turn from the first whenever the sheet changes. With reduced motion she stays on the first frame.
-->
<script lang="ts">
  import type { SpriteSheet } from "./penSprites";

  interface Props {
    sheet: SpriteSheet;
    /** What screen readers hear, such as "Plum, eating" */
    label: string;
    /** Shows this frame and plays nothing */
    frame?: number;
  }

  let { sheet, label, frame }: Props = $props();

  let playingFrame = $state(0);

  $effect(() => {
    const durations = sheet.durations;
    playingFrame = 0;
    if (frame !== undefined || durations.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    let timer: ReturnType<typeof setTimeout>;
    function showNextFrame(): void {
      timer = setTimeout(() => {
        index = (index + 1) % durations.length;
        playingFrame = index;
        showNextFrame();
      }, durations[index] ?? 1000);
    }
    showNextFrame();

    return () => clearTimeout(timer);
  });

  const frameCount = $derived(sheet.durations.length);
  const shownFrame = $derived(frame ?? playingFrame);
  const position = $derived(frameCount > 1 ? (shownFrame / (frameCount - 1)) * 100 : 0);
</script>

<div
  class="sprite"
  role="img"
  aria-label={label}
  data-frame={shownFrame}
  style:width="calc(var(--plum-scale, 6) * {sheet.frameWidth}px)"
  style:height="calc(var(--plum-scale, 6) * {sheet.frameHeight}px)"
  style:background-image="url({sheet.src})"
  style:background-size="{frameCount * 100}% 100%"
  style:background-position="{position}% 0"
></div>

<style>
  .sprite {
    background-repeat: no-repeat;
    image-rendering: pixelated;
  }
</style>
