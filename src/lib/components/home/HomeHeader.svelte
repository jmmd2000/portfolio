<script lang="ts">
  import type { Profile } from "$lib/server/content/profile";

  interface Props {
    profile: Profile;
  }

  let { profile }: Props = $props();

  const words = $derived(profile.name.split(" ").filter(word => word !== ""));
</script>

<header class="home-header">
  <!-- Each letter is its own element so it can lift on hover -->
  <h1 class="name" aria-label={profile.name}>
    {#each words as word, wordIndex (wordIndex)}{wordIndex > 0 ? " " : ""}<span class="word" aria-hidden="true"
        >{#each [...word] as letter, letterIndex (letterIndex)}<span class="letter">{letter}</span>{/each}</span
      >{/each}
  </h1>
  <p class="intro">{profile.intro}</p>
</header>

<style>
  .home-header {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-5) var(--page-padding);
    border-bottom: var(--rule-section);
  }

  .name {
    font-size: clamp(3.5rem, 9vw, 8.5rem);
    font-weight: 900;
    line-height: 0.8;
  }

  .word {
    white-space: nowrap;
  }

  .letter {
    display: inline-block;
    transition:
      transform 250ms var(--ease-out),
      color 250ms var(--ease-out);
  }

  @media (hover: hover) {
    .letter:hover {
      transform: translateY(-0.06em);
      color: var(--red);
    }
  }

  .intro {
    /* In rem, not ch: ch changes with the font, so the text would wrap again when the web font arrives */
    max-width: 30rem;
    font-size: clamp(1.125rem, 1.5vw, 1.375rem);
    font-weight: 500;
    line-height: 1.35;
  }

  /* Side by side, with the intro's last line on the name's baseline, so the two read as one unit */
  @media (min-width: 60rem) {
    .home-header {
      grid-template-columns: auto minmax(0, 30rem);
      justify-content: space-between;
      align-items: last baseline;
      column-gap: var(--space-5);
    }
  }
</style>
