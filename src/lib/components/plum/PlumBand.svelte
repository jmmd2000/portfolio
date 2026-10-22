<!--
  @component
  Plum's red band on the home page: her pen, how she is, her stats, and Feed, Pet and Play. Every visitor shares
  her. The band asks the server how she is every 10 seconds while the tab is visible, and shows what other
  visitors did. With no `plum` (her data couldn't load) she shows asleep with the buttons off.
-->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { isAsleep, moodLine, restingSprite } from "$lib/plum/plumMood";
  import { plumActions, type PlumAction } from "$lib/plum/plumRules";
  import { actionResultSchema, plumStateSchema, type ActionOutcome, type CooldownsLeft, type PlumState } from "$lib/schemas/plumState";
  import { actionsByOthers } from "./actionsByOthers";
  import { gazeAt, gazeFrame, type GazeDirection } from "./gaze";
  import { penSprites, type PenSprite } from "./penSprites";
  import { coolingMessage, doneMessage, othersMessages, refusalMessages, unreachableMessage } from "./plumMessages";
  import PlumSprite from "./PlumSprite.svelte";
  import PlumStats from "./PlumStats.svelte";

  interface Props {
    plum: PlumState | null;
  }

  let { plum }: Props = $props();

  const checkIntervalMilliseconds = 10_000;
  const actionSpriteMilliseconds = 3000;

  const actionNames: Record<PlumAction, string> = { feed: "Feed", pet: "Pet", play: "Play" };
  const actionSprites: Record<PlumAction, PenSprite> = { feed: "eating", pet: "purring", play: "playing" };
  const spriteDescriptions: Record<PenSprite, string> = {
    idle: "sitting",
    watching: "watching you",
    eating: "eating",
    purring: "purring",
    playing: "playing with her ball",
    hungry: "looking hungry",
    full: "turning her nose up at the food",
    asleep: "asleep",
  };

  let latest = $state<PlumState | null>(untrack(() => plum));
  /** When each cooldown ends, by this browser's clock */
  let readyAt = $state<Record<PlumAction, number>>(untrack(() => readyTimes(plum?.cooldowns)));
  let now = $state(Date.now());
  let ready = $state(false);
  let busy = $state(false);
  let message = $state("");
  let actionSprite = $state<PenSprite | null>(null);
  let gaze = $state<GazeDirection | null>(null);

  let band = $state<HTMLElement>();
  let yard = $state<HTMLElement>();
  let reducedMotion = false;
  let actionSpriteTimer: ReturnType<typeof setTimeout> | undefined;
  /** How many times this visitor did each action, so its messages come in turn */
  const actionCounts: Record<PlumAction, number> = { feed: 0, pet: 0, play: 0 };

  const sprite = $derived.by((): { name: PenSprite; frame?: number } => {
    if (!latest) return { name: "asleep" };
    if (actionSprite) return { name: actionSprite };
    if (gaze && !isAsleep(latest.stats)) return { name: "watching", frame: gazeFrame(gaze) };
    return { name: restingSprite(latest.stats) };
  });

  function readyTimes(cooldowns: CooldownsLeft | undefined): Record<PlumAction, number> {
    const start = Date.now();
    return {
      feed: start + (cooldowns?.feed ?? 0) * 1000,
      pet: start + (cooldowns?.pet ?? 0) * 1000,
      play: start + (cooldowns?.play ?? 0) * 1000,
    };
  }

  function secondsLeft(action: PlumAction): number {
    return Math.max(0, Math.ceil((readyAt[action] - now) / 1000));
  }

  function buttonText(action: PlumAction): string {
    const seconds = secondsLeft(action);
    return seconds > 0 ? `${actionNames[action]} again in ${seconds}s` : actionNames[action];
  }

  function remember(state: PlumState): void {
    latest = state;
    readyAt = readyTimes(state.cooldowns);
    now = Date.now();
  }

  /** Shows a sprite for three seconds, then goes back to how she is at rest */
  function showSprite(name: PenSprite): void {
    clearTimeout(actionSpriteTimer);
    actionSprite = name;
    actionSpriteTimer = setTimeout(() => (actionSprite = null), actionSpriteMilliseconds);
  }

  function showOutcome(action: PlumAction, outcome: ActionOutcome): void {
    if (outcome === "done") {
      showSprite(actionSprites[action]);
      message = doneMessage(action, actionCounts[action]);
      actionCounts[action] += 1;
    } else if (outcome === "full") {
      showSprite("full");
      message = refusalMessages.full;
    } else if (outcome === "tired") {
      showSprite("asleep");
      message = refusalMessages.tired;
    } else {
      message = coolingMessage;
    }
  }

  async function doAction(action: PlumAction): Promise<void> {
    busy = true;
    try {
      const response = await fetch("/api/plum", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      if (!response.ok) throw new Error(`The server answered ${response.status}`);

      const result = actionResultSchema.parse(await response.json());
      remember(result);
      showOutcome(action, result.outcome);
    } catch {
      message = unreachableMessage;
    } finally {
      busy = false;
    }
  }

  /** Asks how she is now. If that fails she stays as she was, and the next check tries again */
  async function check(): Promise<void> {
    try {
      const response = await fetch("/api/plum");
      if (!response.ok) return;

      const state = plumStateSchema.parse(await response.json());
      const expected = { feed: secondsLeft("feed"), pet: secondsLeft("pet"), play: secondsLeft("play") };
      const othersAction = actionsByOthers(expected, state.cooldowns).at(-1);
      remember(state);

      if (othersAction && !actionSprite) {
        showSprite(actionSprites[othersAction]);
        message = othersMessages[othersAction];
      }
    } catch {
      // Keeps her last known state
    }
  }

  /** Turns her head towards the pointer while it's over the band */
  function watchPointer(event: PointerEvent): void {
    if (reducedMotion || event.pointerType === "touch" || !band || !yard) return;

    const bandBox = band.getBoundingClientRect();
    const isOverBand = event.clientX >= bandBox.left && event.clientX <= bandBox.right && event.clientY >= bandBox.top && event.clientY <= bandBox.bottom;
    if (!isOverBand) {
      gaze = null;
      return;
    }

    const yardBox = yard.getBoundingClientRect();
    // Her face sits a little above the middle of the pen
    const faceX = yardBox.left + yardBox.width / 2;
    const faceY = yardBox.top + yardBox.height * 0.4;
    gaze = gazeAt(event.clientX - faceX, event.clientY - faceY, yardBox.width * 0.25);
  }

  onMount(() => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ready = true;

    const clock = setInterval(() => (now = Date.now()), 1000);
    const checks = setInterval(() => {
      if (!document.hidden) void check();
    }, checkIntervalMilliseconds);
    function checkWhenShown(): void {
      if (!document.hidden) void check();
    }
    document.addEventListener("visibilitychange", checkWhenShown);

    return () => {
      clearInterval(clock);
      clearInterval(checks);
      clearTimeout(actionSpriteTimer);
      document.removeEventListener("visibilitychange", checkWhenShown);
    };
  });
</script>

<svelte:window onpointermove={watchPointer} />

<svelte:head>
  {#each Object.values(penSprites) as sheet (sheet.src)}
    <link rel="preload" as="image" href={sheet.src} />
  {/each}
</svelte:head>

<section class="plum" aria-labelledby="plum-heading" bind:this={band}>
  <h2 class="section-title" id="plum-heading">Plum</h2>
  <div class="pen">
    <div class="yard" bind:this={yard}>
      <PlumSprite sheet={penSprites[sprite.name]} frame={sprite.frame} label="Plum, {spriteDescriptions[sprite.name]}" />
    </div>
    <div>
      <h3 class="mood">{latest ? moodLine(latest.stats) : "She's asleep"}</h3>
      <p class="about">The site's cat. Every visitor shares her, so whatever you do, the next person sees.</p>
      {#if latest}
        <PlumStats stats={latest.stats} />
      {/if}
      <div class="actions">
        {#each plumActions as action (action)}
          <button type="button" disabled={!ready || !latest || busy || secondsLeft(action) > 0} onclick={() => doAction(action)}>{buttonText(action)}</button>
        {/each}
      </div>
      <p class="message" role="status">{message}</p>
    </div>
  </div>
</section>

<style>
  /* The band keeps its light colours in dark mode too, so the black cat shows */
  .plum {
    --ink: oklch(0.16 0.01 40);
    --paper: oklch(0.965 0.004 80);
    --red: oklch(0.6 0.21 32);
    --rule-row: 2px solid var(--ink);

    padding: var(--space-3) var(--page-padding) var(--space-5);
    border-bottom: var(--rule-section);
    background: var(--red);
    color: var(--ink);

    &:last-of-type {
      border-bottom: none;
    }

    :global(:focus-visible) {
      outline-color: var(--ink);
    }
  }

  .section-title {
    color: var(--ink);
  }

  .pen {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--space-5);
    align-items: center;
  }

  .yard {
    --plum-scale: 8;

    display: grid;
    place-items: center;
    width: min(100%, 22rem);
    aspect-ratio: 1;
    outline: var(--rule-row);
    background: var(--paper);
  }

  .mood {
    font-size: var(--type-large);
    font-weight: 900;
    line-height: 0.95;
  }

  .about {
    max-width: 40ch;
    margin: var(--space-2) 0 0;
    font-weight: 500;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: var(--space-3);

    button {
      min-height: 3rem;
      padding: 0.75rem 1.5rem;
      border: var(--rule-row);
      border-radius: 0;
      background: transparent;
      color: var(--ink);
      font: 900 var(--type-label) / 1 var(--font-display);
      text-transform: uppercase;
      cursor: pointer;
      transition:
        transform var(--duration-quick) var(--ease-out),
        box-shadow var(--duration-quick) var(--ease-out);

      &:first-child {
        background: var(--ink);
        color: var(--paper);
      }

      &:disabled {
        opacity: 0.55;
        cursor: default;
      }

      &:active:not(:disabled) {
        transform: none;
        box-shadow: none;
      }
    }
  }

  .message {
    min-height: 1.5em;
    margin: var(--space-2) 0 0;
    font-weight: 700;
  }

  @media (hover: hover) {
    .actions button:hover:not(:disabled) {
      transform: translate(-3px, -3px);
      box-shadow: 3px 3px 0 var(--ink);
    }
  }

  @media (max-width: 47.5rem) {
    .pen {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-3);
    }

    .yard {
      width: min(100%, 18rem);
    }
  }

  @media (max-width: 22rem) {
    .yard {
      --plum-scale: 6;
    }
  }
</style>
