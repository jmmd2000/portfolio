<!--
  @component
  Plum's red band on the home page: how she is, her pen, and a grid of four buttons beside it. Feed, Pet and Play
  each show the level they change, and Let her out shows how many times her ball was thrown. The visitor can swap
  the pen to a photo of the real Plum and back. Every visitor shares her. The band asks the server how she is
  every 10 seconds while the tab is visible, and shows what other visitors did. Under the pen, a message after an
  action shows for 10 seconds, then the line goes back to when she was last fed. Awake, she blinks every
  few seconds and plays a short animation now and then. Asleep, her ear flicks now and then. The visitor can let
  her out to chase her ball around the window, which leaves the pen empty and the actions off until she's back.
  None of this moves if the visitor asks for reduced motion. With no `plum` (her data couldn't load) she shows
  asleep with the buttons off.
-->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { isHungry, moodLine, restingSprite } from "$lib/plum/plumMood";
  import { plumActions, type PlumAction, type PlumStats } from "$lib/plum/plumRules";
  import { actionResultSchema, plumStateSchema, throwResultSchema, type ActionOutcome, type CooldownsLeft, type PlumState } from "$lib/schemas/plumState";
  import { actionsByOthers } from "./actionsByOthers";
  import { ballSheet, chaseSprites } from "./chaseSprites";
  import { gazeAt, gazeFrame, type GazeDirection } from "./gaze";
  import { idleAnimations, penSprites, type IdleAnimation, type PenSprite } from "./penSprites";
  import { coolingMessage, doneMessage, hungryMessages, othersMessages, othersSleepMessages, outMessages, refusalMessages, sleepMessages, unreachableMessage } from "./plumMessages";
  import PlumChase from "./PlumChase.svelte";
  import PlumSprite from "./PlumSprite.svelte";
  import { lastFedLine } from "./lastFed";
  import { realPlumPhotoDescription, realPlumPhotoURL } from "./realPlumPhoto";

  interface Props {
    plum: PlumState | null;
  }

  let { plum }: Props = $props();

  const checkIntervalMilliseconds = 10_000;
  const messageMilliseconds = 10_000;
  const shutterMilliseconds = 260;
  const actionSpriteMilliseconds = 3000;
  const idleWaitMilliseconds = { shortest: 8000, longest: 12000 };
  const blinkWaitMilliseconds = { shortest: 2500, longest: 5500 };

  const actionNames: Record<PlumAction, string> = { feed: "Feed", pet: "Pet", play: "Play" };
  /** The level each button shows */
  const actionStats: Record<PlumAction, keyof PlumStats> = { feed: "food", pet: "happiness", play: "energy" };
  const statNames: Record<keyof PlumStats, string> = { food: "Food", happiness: "Happiness", energy: "Energy" };
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
    sleepPurr: "purring in her sleep",
    // A blink or a flick in her sleep keeps the label she had, so screen readers aren't told about each one
    sleepEar: "asleep",
    blink: "sitting",
    watchingBlink: "watching you",
    earTwitch: "twitching an ear",
    tailFlick: "flicking her tail",
    pawLick: "licking her paw",
    empty: "out of her pen",
  };

  let latest = $state<PlumState | null>(untrack(() => plum));
  /** When each cooldown ends, by this browser's clock */
  let readyAt = $state<Record<PlumAction, number>>(untrack(() => readyTimes(plum?.cooldowns)));
  /** When she was last fed, by this browser's clock, or null if nobody has fed her yet */
  let fedAt = $state<number | null>(untrack(() => fedTime(plum?.lastFedSecondsAgo ?? null)));
  /** When this visitor last fed her, by this browser's clock, so the line can say "You" */
  let ownFeedAt = $state<number | null>(null);
  let now = $state(Date.now());
  let ready = $state(false);
  let busy = $state(false);
  let message = $state("");
  let actionSprite = $state<PenSprite | null>(null);
  let idleAnimation = $state<IdleAnimation | null>(null);
  /** 0 with her eyes open, 1 half shut, 2 shut */
  let blinkStep = $state(0);
  let gaze = $state<GazeDirection | null>(null);
  let showingPhoto = $state(false);
  let out = $state(false);
  /** The middle of her pen across the window when she was let out, where she jumps out */
  let outFromX = $state(0);
  let chase = $state<ReturnType<typeof PlumChase>>();

  let band = $state<HTMLElement>();
  let yard = $state<HTMLElement>();
  let shutter = $state<HTMLElement>();
  let swappingPhoto = false;
  let reducedMotion = false;
  let actionSpriteTimer: ReturnType<typeof setTimeout> | undefined;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let idleEndTimer: ReturnType<typeof setTimeout> | undefined;
  let blinkTimer: ReturnType<typeof setTimeout> | undefined;
  let messageTimer: ReturnType<typeof setTimeout> | undefined;
  /** How many times this visitor did each action, so its messages come in turn */
  const actionCounts: Record<PlumAction, number> = { feed: 0, pet: 0, play: 0 };

  const sprite = $derived.by((): { name: PenSprite; frame?: number; loop?: boolean } => {
    if (out) return { name: "empty" };
    if (!latest) return { name: "asleep" };
    if (actionSprite) return { name: actionSprite };
    if (gaze && !latest.sleep) {
      if (blinkStep > 0) return { name: "watchingBlink", frame: gazeFrame(gaze) * 2 + blinkStep - 1 };
      return { name: "watching", frame: gazeFrame(gaze) };
    }

    const resting = restingSprite(latest);
    if (resting === "asleep" && idleAnimation === "sleepEar") return { name: idleAnimation, loop: false };
    if (resting === "idle" && idleAnimation && idleAnimation !== "sleepEar") return { name: idleAnimation, loop: false };
    if (resting === "idle" && blinkStep > 0) return { name: "blink", frame: blinkStep - 1 };
    return { name: resting };
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

  function statLevel(action: PlumAction): number {
    return latest ? Math.round(latest.stats[actionStats[action]]) : 0;
  }

  /** The line under an action's name: its level, and how long until it can be done again */
  function actionNote(action: PlumAction): string {
    const level = `${statNames[actionStats[action]]} ${statLevel(action)}%`;
    const seconds = secondsLeft(action);
    if (seconds > 0) return `${level}, again in ${seconds}s`;
    return action === "play" ? `${level}, play uses it` : level;
  }

  const throwsNote = $derived.by(() => {
    if (!latest) return "";
    return `Ball thrown ${latest.throws.toLocaleString("en-GB")} ${latest.throws === 1 ? "time" : "times"}`;
  });

  const lastFedText = $derived.by(() => {
    if (!latest) return "";
    const secondsAgo = fedAt === null ? null : Math.max(0, Math.floor((now - fedAt) / 1000));
    const fedByThisVisitor = ownFeedAt !== null && fedAt !== null && Math.abs(fedAt - ownFeedAt) < 2000;
    return lastFedLine(secondsAgo, fedByThisVisitor);
  });

  function fedTime(lastFedSecondsAgo: number | null): number | null {
    return lastFedSecondsAgo === null ? null : Date.now() - lastFedSecondsAgo * 1000;
  }

  function remember(state: PlumState): void {
    latest = state;
    readyAt = readyTimes(state.cooldowns);
    fedAt = fedTime(state.lastFedSecondsAgo);
    now = Date.now();
  }

  /** Shows a message under the buttons for 10 seconds */
  function say(text: string): void {
    clearTimeout(messageTimer);
    message = text;
    messageTimer = setTimeout(() => (message = ""), messageMilliseconds);
  }

  /** Shows a sprite for three seconds, then goes back to how she is at rest */
  function showSprite(name: PenSprite): void {
    clearTimeout(actionSpriteTimer);
    actionSprite = name;
    actionSpriteTimer = setTimeout(() => (actionSprite = null), actionSpriteMilliseconds);
  }

  /**
   * Shows her reaction to the visitor's action and says what happened.
   *
   * @param before how she was just before, so a hungry cat's messages mention her food
   * @param after how she is afterwards, so a pet while she's asleep shows her purring in her sleep
   */
  function showOutcome(action: PlumAction, outcome: ActionOutcome, before: PlumState | null, after: PlumState): void {
    if (outcome === "cooling") {
      say(coolingMessage);
    } else if (outcome === "full") {
      showSprite("full");
      say(refusalMessages.full);
    } else if (outcome === "asleep") {
      showSprite("asleep");
      say(refusalMessages.asleep);
    } else if (outcome === "woke") {
      showSprite("playing");
      say(sleepMessages.woken);
    } else if (action === "pet" && after.sleep) {
      showSprite("sleepPurr");
      say(sleepMessages.petted);
    } else if (action !== "feed" && before && isHungry(before)) {
      showSprite(actionSprites[action]);
      say(hungryMessages[action]);
    } else {
      showSprite(actionSprites[action]);
      say(doneMessage(action, actionCounts[action]));
      actionCounts[action] += 1;
      if (action === "feed") ownFeedAt = fedAt;
    }
  }

  /** Shows what another visitor just did, as this visitor would have seen it */
  function showOthersAction(action: PlumAction, before: PlumState | null, after: PlumState): void {
    if (action === "pet" && after.sleep) {
      showSprite("sleepPurr");
      say(othersSleepMessages.petted);
    } else if (action === "play" && before?.sleep && !after.sleep) {
      showSprite("playing");
      say(othersSleepMessages.woken);
    } else {
      showSprite(actionSprites[action]);
      say(othersMessages[action]);
    }
  }

  async function doAction(action: PlumAction): Promise<void> {
    busy = true;
    try {
      const response = await fetch("/api/plum", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      if (!response.ok) throw new Error(`The server answered ${response.status}`);

      const result = actionResultSchema.parse(await response.json());
      const before = latest;
      remember(result);
      showOutcome(action, result.outcome, before, result);
    } catch {
      say(unreachableMessage);
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
      const before = latest;
      remember(state);

      if (othersAction && !actionSprite) showOthersAction(othersAction, before, state);
    } catch {
      // Keeps her last known state
    }
  }

  /**
   * Waits 8 to 12 seconds, then plays a random idle animation if she's sitting idle, or flicks her ear if she's
   * asleep, and waits again
   */
  function waitForIdle(): void {
    const wait = idleWaitMilliseconds.shortest + Math.random() * (idleWaitMilliseconds.longest - idleWaitMilliseconds.shortest);
    idleTimer = setTimeout(() => {
      if (!document.hidden && sprite.name === "idle") playIdle(idleAnimations[Math.floor(Math.random() * idleAnimations.length)] ?? "earTwitch");
      if (!document.hidden && sprite.name === "asleep") playIdle("sleepEar");
      waitForIdle();
    }, wait);
  }

  function playIdle(name: IdleAnimation): void {
    const length = penSprites[name].durations.reduce((total, duration) => total + duration, 0);
    idleAnimation = name;
    idleEndTimer = setTimeout(() => (idleAnimation = null), length);
  }

  /** Waits 2.5 to 5.5 seconds, blinks, and waits again. A blink only shows while she's idle or watching */
  function waitForBlink(): void {
    const wait = blinkWaitMilliseconds.shortest + Math.random() * (blinkWaitMilliseconds.longest - blinkWaitMilliseconds.shortest);
    blinkTimer = setTimeout(() => {
      if (!document.hidden) blink();
      waitForBlink();
    }, wait);
  }

  /** Half shut, shut, half shut, open: about a quarter of a second */
  function blink(): void {
    blinkStep = 1;
    setTimeout(() => (blinkStep = 2), 70);
    setTimeout(() => (blinkStep = 1), 180);
    setTimeout(() => (blinkStep = 0), 250);
  }

  /**
   * Swaps the pen between pixel Plum and her photo. An ink shutter slides across and covers the pen, the picture
   * changes behind it, and the shutter slides off the other side. The shutter waits for the photo to load
   */
  async function togglePhoto(): Promise<void> {
    if (swappingPhoto) return;
    if (reducedMotion || !shutter) {
      showingPhoto = !showingPhoto;
      return;
    }

    swappingPhoto = true;
    const timing: KeyframeAnimationOptions = { duration: shutterMilliseconds, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" };
    const cover = shutter.animate([{ transform: "translateX(-101%)" }, { transform: "translateX(0)" }], timing);
    await Promise.all([cover.finished, showingPhoto ? Promise.resolve() : loadPhoto()]);
    showingPhoto = !showingPhoto;
    await shutter.animate([{ transform: "translateX(0)" }, { transform: "translateX(101%)" }], timing).finished;
    for (const animation of shutter.getAnimations()) animation.cancel();
    swappingPhoto = false;
  }

  /** Loads and decodes her photo. It resolves even if that fails, so the shutter never gets stuck */
  async function loadPhoto(): Promise<void> {
    if (!realPlumPhotoURL) return;
    const photo = new Image();
    photo.src = realPlumPhotoURL;
    await photo.decode().catch(() => undefined);
  }

  /** The middle of her pen across the window */
  function penX(): number {
    if (!yard) return window.innerWidth / 2;
    const yardBox = yard.getBoundingClientRect();
    return yardBox.left + yardBox.width / 2;
  }

  /** Lets her out to chase her ball, or calls her back once she's out. She stays in with reduced motion */
  function toggleOut(): void {
    if (out) {
      chase?.callBack(penX());
    } else if (reducedMotion) {
      say(outMessages.reducedMotion);
    } else {
      outFromX = penX();
      out = true;
    }
  }

  /** Counts a throw on the server and shows the new total. A refused or failed throw is skipped */
  async function saveThrow(): Promise<void> {
    try {
      const response = await fetch("/api/plum/throws", { method: "POST" });
      if (!response.ok) return;

      const { throws } = throwResultSchema.parse(await response.json());
      if (latest) latest = { ...latest, throws };
    } catch {
      // The next check brings the total up to date
    }
  }

  /** Turns her head towards the pointer while it's over the band */
  function watchPointer(event: PointerEvent): void {
    if (out || reducedMotion || event.pointerType === "touch" || !band || !yard) return;

    const bandBox = band.getBoundingClientRect();
    const isOverBand = event.clientX >= bandBox.left && event.clientX <= bandBox.right && event.clientY >= bandBox.top && event.clientY <= bandBox.bottom;
    if (!isOverBand) {
      gaze = null;
      return;
    }

    const yardBox = yard.getBoundingClientRect();
    const scale = Number(getComputedStyle(yard).getPropertyValue("--plum-scale")) || 8;
    // She sits on the bottom of the pen, with her face about 18 sprite pixels up
    const faceX = yardBox.left + yardBox.width / 2;
    const faceY = yardBox.bottom - 18 * scale;
    gaze = gazeAt(event.clientX - faceX, event.clientY - faceY, yardBox.width * 0.25);
  }

  onMount(() => {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ready = true;
    if (!reducedMotion) {
      waitForIdle();
      waitForBlink();
      // Loads her chase sprites early, so she has them the moment she's let out
      for (const sheet of [...Object.values(chaseSprites), ballSheet]) new Image().src = sheet.src;
    }

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
      clearTimeout(idleTimer);
      clearTimeout(idleEndTimer);
      clearTimeout(blinkTimer);
      clearTimeout(messageTimer);
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
  <h3 class="mood">{out ? outMessages.mood : latest ? moodLine(latest) : "She's asleep"}</h3>
  <div class="pen-block">
    <div class="pen">
      <div class="yard" bind:this={yard}>
        {#if !showingPhoto}
          <PlumSprite sheet={penSprites[sprite.name]} frame={sprite.frame} loop={sprite.loop} label="Plum, {spriteDescriptions[sprite.name]}" />
        {:else if realPlumPhotoURL}
          <img class="photo" src={realPlumPhotoURL} alt={realPlumPhotoDescription} />
        {:else}
          <p class="photo">Nothing here yet.</p>
        {/if}
        <div class="shutter" bind:this={shutter} aria-hidden="true"></div>
      </div>
      <div class="controls">
        {#each plumActions as action (action)}
          <button type="button" class="control" disabled={!ready || !latest || busy || out || secondsLeft(action) > 0} onclick={() => doAction(action)}>
            <span class="control-name">{actionNames[action]}</span>
            {#if latest}
              <span class="meter" aria-hidden="true"><span style:transform="scaleX({statLevel(action) / 100})"></span></span>
              <span class="note">{actionNote(action)}</span>
            {/if}
          </button>
        {/each}
        <button type="button" class="control out" disabled={!ready || !latest} onclick={toggleOut}>
          <span class="control-name">{out ? "Call her back" : "Let her out"}</span>
          {#if latest}<span class="note">{throwsNote}</span>{/if}
        </button>
      </div>
    </div>
    <div class="under">
      <p class="message">
        <span role="status">{message}</span>
        <!-- Not announced: it changes every minute as the time goes on -->
        {#if !message}<span>{lastFedText}</span>{/if}
      </p>
      <button type="button" class="photo-toggle" disabled={!ready} onclick={togglePhoto}>{showingPhoto ? "Back to pixel Plum" : "See the real Plum"}</button>
    </div>
  </div>
  {#if out}
    <PlumChase penX={outFromX} onhome={() => (out = false)} onthrow={saveThrow} bind:this={chase} />
  {/if}
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
    margin-bottom: var(--space-2);
    color: var(--ink);
  }

  .mood {
    margin-bottom: var(--space-3);
    font-size: var(--type-large);
    font-weight: 900;
    line-height: 0.95;
  }

  .pen-block {
    width: fit-content;
    max-width: 100%;
  }

  /* The 2px gaps show the ink background, so the pen and the buttons read as one block with ink lines between */
  .pen {
    display: grid;
    grid-template-columns: 18rem minmax(0, 36rem);
    gap: 2px;
    outline: var(--rule-row);
    background: var(--ink);
  }

  .yard {
    --plum-scale: 8;

    position: relative;
    display: grid;
    place-items: end center;
    min-height: 16rem;
    overflow: hidden;
    background: var(--paper);

    /* Her sprites have two empty rows under her feet, so this sets her on the bottom of the pen */
    > :global(.sprite) {
      margin-bottom: calc(var(--plum-scale) * -2px);
    }
  }

  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    object-fit: cover;
  }

  p.photo {
    display: grid;
    place-items: center;
  }

  .shutter {
    position: absolute;
    inset: 0;
    background: var(--ink);
    transform: translateX(-101%);
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2px;
  }

  .control {
    display: grid;
    align-content: start;
    gap: var(--space-1);
    padding: var(--space-2) 1.25rem 1.25rem;
    border: none;
    border-radius: 0;
    background: var(--red);
    color: var(--ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      background-color var(--duration-quick) var(--ease-out),
      color var(--duration-quick) var(--ease-out);

    &:focus-visible {
      outline-offset: -6px;
    }

    &:disabled {
      cursor: default;

      > * {
        opacity: 0.5;
      }
    }
  }

  .out {
    background: var(--ink);
    color: var(--paper);

    &:focus-visible {
      outline-color: var(--paper);
    }
  }

  .control-name {
    font: 900 1.75rem / 0.95 var(--font-display);
    text-transform: uppercase;
  }

  .meter {
    height: 0.5rem;
    overflow: hidden;
    background: var(--red-deep);
    transition: background-color var(--duration-quick) var(--ease-out);

    > span {
      display: block;
      height: 100%;
      background: var(--ink);
      transform-origin: left;
      transition:
        transform var(--duration-lift) var(--ease-out),
        background-color var(--duration-quick) var(--ease-out);
    }
  }

  .note {
    font-size: var(--type-small);
    font-weight: 700;
  }

  .under {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 0 var(--space-3);
    margin-top: var(--space-2);
  }

  .message {
    min-width: 0;
    min-height: 1.5em;
    margin: 0;
    font-weight: 700;
  }

  .photo-toggle {
    padding: var(--space-1) 0;
    border: none;
    background: none;
    color: var(--ink);
    font: inherit;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 5px;
    cursor: pointer;
    transition: text-decoration-thickness var(--duration-quick) var(--ease-out);

    &:disabled {
      cursor: default;
    }
  }

  @media (hover: hover) {
    .control:not(.out):hover:not(:disabled) {
      background: var(--ink);
      color: var(--paper);

      .meter {
        background: color-mix(in oklch, var(--paper) 25%, var(--ink));
      }

      .meter > span {
        background: var(--paper);
      }
    }

    .out:hover:not(:disabled) {
      background: var(--paper);
      color: var(--ink);
    }

    .photo-toggle:hover:not(:disabled) {
      text-decoration-thickness: 6px;
    }
  }

  @media (max-width: 47.5rem) {
    .pen-block {
      width: auto;
    }

    .pen {
      grid-template-columns: minmax(0, 1fr);
    }

    .yard {
      --plum-scale: 6;

      min-height: 13rem;
    }

    .control-name {
      font-size: 1.5rem;
    }
  }
</style>
