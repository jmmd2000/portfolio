<script lang="ts">
  import type { Profile } from "$lib/server/content/profile";

  interface Props {
    profile: Profile;
  }

  let { profile }: Props = $props();

  // Each letter is its own element so the ones near the pointer can widen
  const characters = $derived([...profile.name]);

  const letterElements = $state<HTMLSpanElement[]>([]);
  let nearIndexes = $state<number[]>([]);
  let letterCentres: { index: number; x: number; width: number }[] = [];
  let pointerX = 0;
  let frame = 0;

  function canWiden(): boolean {
    return window.matchMedia("(hover: hover)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // Measured once when the pointer arrives, so moving it doesn't read the layout on every event
  function measureLetters(): void {
    if (!canWiden()) return;
    letterCentres = [];
    letterElements.forEach((letter, index) => {
      if (!letter) return;
      const box = letter.getBoundingClientRect();
      letterCentres.push({ index, x: box.left + box.width / 2, width: box.width });
    });
  }

  function widenNearPointer(event: PointerEvent): void {
    if (letterCentres.length === 0) return;
    pointerX = event.clientX;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      nearIndexes = letterCentres.filter(centre => Math.abs(pointerX - centre.x) < centre.width * 1.2).map(centre => centre.index);
    });
  }

  function resetLetters(): void {
    nearIndexes = [];
    letterCentres = [];
  }
</script>

<header class="header">
  <h1 class="name" aria-label={profile.name} onpointerenter={measureLetters} onpointermove={widenNearPointer} onpointerleave={resetLetters}>
    <span aria-hidden="true">
      {#each characters as character, index (index)}
        {#if character === " "}
          {character}
        {:else}
          <span class="letter" class:near={nearIndexes.includes(index)} bind:this={letterElements[index]}>{character}</span>
        {/if}
      {/each}
    </span>
  </h1>
  <p class="intro">{profile.intro}</p>
</header>

<style>
  .header {
    padding-block: var(--space-8) var(--space-7);
  }

  .name {
    color: var(--colour-foreground);
    font-size: var(--font-size-display);
    font-weight: 620;
    font-stretch: var(--font-stretch-display);
    line-height: 0.92;
    letter-spacing: -0.01em;
  }

  .letter {
    display: inline-block;
    transition:
      font-stretch 500ms var(--ease-out),
      font-weight 500ms var(--ease-out);

    &.near {
      font-stretch: 125%;
      font-weight: 780;
    }
  }

  .intro {
    max-width: 34ch;
    margin-top: var(--space-6);
    color: var(--colour-foreground);
    font-size: var(--font-size-lead);
    font-weight: 450;
    line-height: 1.4;
  }

  @media (max-width: 52rem) {
    .header {
      padding-block: var(--space-6);
    }
  }
</style>
