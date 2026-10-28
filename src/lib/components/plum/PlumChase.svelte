<!--
  @component
  Plum out of her pen, chasing her ball around the window. She lives on a fixed layer over the whole window that
  ignores the pointer and is hidden from screen readers, so the page underneath still works. Only the ball takes the
  pointer: the visitor drags it and lets go to throw it. Everything moves on the physics clock, which stops while
  the tab is hidden and never jumps more than a tenth of a second, so she never jumps ahead when the tab comes back.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { ballFrame, ballRadius, isThrow, stepsFor, throwVelocity, type Ball, type Playground, type PointerSample } from "./ballPhysics";
  import { ballSheet, chaseSprites, spritePixel } from "./chaseSprites";
  import { frameAt } from "./frameAt";
  import { callBack as walkBack, letOut, phaseSprites, stepChase, type Chase } from "./plumChase";
  import PlumSprite from "./PlumSprite.svelte";

  interface Props {
    /** The middle of her pen across the window, where she jumps out */
    penX: number;
    /** Called once she has jumped back into her pen */
    onhome: () => void;
    /** Called for each release fast enough to count as a throw */
    onthrow?: () => void;
  }

  let { penX, onhome, onthrow }: Props = $props();

  /** The ball takes the pointer over at least this many CSS pixels, so it's easy to grab on a phone */
  const smallestGrabArea = 44;
  /** How long the pointer's positions are kept while it holds the ball, in milliseconds */
  const sampleMilliseconds = 200;

  let playgroundElement = $state<HTMLElement>();
  let playground = $state<Playground>({ width: 0, height: 0, pixel: 3 });
  let chase = $state.raw<Chase | null>(null);
  let samples: PointerSample[] = [];
  let leftOver = 0;
  let lastFrameTime: number | null = null;

  const plumSprite = $derived(chase ? phaseSprites[chase.plum.phase] : phaseSprites.sitting);
  const plumSheet = $derived(chaseSprites[plumSprite.name]);
  const plumFrame = $derived(chase ? frameAt(plumSheet.durations, chase.plum.phaseSeconds * 1000, plumSprite.loop) : 0);
  const grabSize = $derived(Math.max(smallestGrabArea, ballSheet.frameWidth * playground.pixel));

  /** Sends her walking back to `homeX`, the middle of her pen across the window, to jump back in */
  export function callBack(homeX: number): void {
    if (chase) chase = walkBack(chase, homeX, playground);
  }

  function measure(): void {
    if (!playgroundElement) return;
    const box = playgroundElement.getBoundingClientRect();
    playground = { width: box.width, height: box.height, pixel: spritePixel(box.width) };
  }

  function nextFrame(time: number): boolean {
    if (!chase) return true;

    const frameSeconds = lastFrameTime === null ? 0 : (time - lastFrameTime) / 1000;
    lastFrameTime = time;
    const { steps, leftOver: timeLeft } = stepsFor(frameSeconds, leftOver);
    leftOver = timeLeft;

    let moved = chase;
    for (let step = 0; step < steps; step++) moved = stepChase(moved, playground);
    chase = moved;

    if (moved.plum.phase !== "home") return true;
    onhome();
    return false;
  }

  /** The ball centred on the pointer, kept inside the window */
  function ballAtPointer(event: PointerEvent): Ball {
    const radius = ballRadius(playground);
    const x = Math.min(Math.max(event.clientX, radius), playground.width - radius);
    const y = Math.min(Math.max(event.clientY, radius), playground.height - radius);
    return { x, y, velocityX: 0, velocityY: 0 };
  }

  function grab(event: PointerEvent): void {
    if (!chase || !(event.currentTarget instanceof HTMLElement)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    samples = [{ x: event.clientX, y: event.clientY, time: event.timeStamp }];
    chase = { ...chase, ball: ballAtPointer(event), ballHeld: true };
  }

  function drag(event: PointerEvent): void {
    if (!chase?.ballHeld) return;
    samples = [...samples.filter(sample => event.timeStamp - sample.time <= sampleMilliseconds), { x: event.clientX, y: event.clientY, time: event.timeStamp }];
    chase = { ...chase, ball: ballAtPointer(event) };
  }

  function release(): void {
    if (!chase?.ballHeld) return;
    const velocity = throwVelocity(samples);
    chase = { ...chase, ball: { ...chase.ball, ...velocity }, ballHeld: false };
    if (isThrow(velocity)) onthrow?.();
  }

  /** Lets go of the ball with no speed, for a drag the browser cancelled, such as when the tab changes mid-throw */
  function drop(): void {
    if (!chase?.ballHeld) return;
    chase = { ...chase, ballHeld: false };
  }

  onMount(() => {
    measure();
    chase = letOut(penX, playground);

    const resizes = new ResizeObserver(measure);
    if (playgroundElement) resizes.observe(playgroundElement);

    // The browser stops calling this while the tab is hidden, so she pauses with it
    let frameRequest = requestAnimationFrame(function animate(time) {
      if (nextFrame(time)) frameRequest = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(frameRequest);
      resizes.disconnect();
    };
  });
</script>

<div class="playground" bind:this={playgroundElement} aria-hidden="true" style:--plum-scale={playground.pixel}>
  {#if chase}
    <div
      class="plum"
      class:facing-left={chase.plum.facing === "left"}
      style:transform="translate({chase.plum.x - (plumSheet.frameWidth / 2) * playground.pixel}px, {playground.height - plumSheet.frameHeight * playground.pixel}px)"
    >
      <PlumSprite sheet={plumSheet} frame={plumFrame} label="Plum" />
    </div>
    <!-- A toy for the pointer only. The whole layer is hidden from screen readers -->
    <div
      class="plum-ball"
      role="presentation"
      class:held={chase.ballHeld}
      style:width="{grabSize}px"
      style:height="{grabSize}px"
      style:transform="translate({chase.ball.x - grabSize / 2}px, {chase.ball.y - grabSize / 2}px)"
      onpointerdown={grab}
      onpointermove={drag}
      onpointerup={release}
      onpointercancel={drop}
      onlostpointercapture={drop}
    >
      <PlumSprite sheet={ballSheet} frame={ballFrame(chase.ball.x, playground)} label="Plum's ball" />
    </div>
  {/if}
</div>

<style>
  .playground {
    position: fixed;
    inset: 0;
    z-index: 10;
    overflow: hidden;
    pointer-events: none;
  }

  .plum,
  .plum-ball {
    position: absolute;
    top: 0;
    left: 0;
    /* A rim one sprite pixel wide, so the black cat and ball show on a dark page */
    filter: drop-shadow(calc(var(--plum-scale) * 1px) 0 0 var(--sprite-rim)) drop-shadow(calc(var(--plum-scale) * -1px) 0 0 var(--sprite-rim))
      drop-shadow(0 calc(var(--plum-scale) * 1px) 0 var(--sprite-rim)) drop-shadow(0 calc(var(--plum-scale) * -1px) 0 var(--sprite-rim));
  }

  .facing-left :global(.sprite) {
    transform: scaleX(-1);
  }

  .plum-ball {
    display: grid;
    place-items: center;
    pointer-events: auto;
    touch-action: none;
    cursor: grab;

    &.held {
      cursor: grabbing;
    }
  }
</style>
