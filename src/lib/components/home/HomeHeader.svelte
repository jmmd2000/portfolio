<script lang="ts">
  import { fitText } from "$lib/attachments/fitText";
  import Nav from "$lib/components/navigation/Nav.svelte";
  import type { Profile } from "$lib/server/content/profile";

  interface Props {
    profile: Profile;
    hasArticles: boolean;
  }

  let { profile, hasArticles }: Props = $props();

  const words = $derived(profile.name.split(" ").filter(word => word !== ""));
</script>

<header class="home-header">
  <!-- Each letter is its own element so it can lift on hover -->
  <h1 class="fitted-line" aria-label={profile.name} {@attach fitText(10)}>
    {#each words as word, wordIndex (wordIndex)}
      <span class="part" aria-hidden="true"
        >{#each [...word] as letter, letterIndex (letterIndex)}<span class="letter">{letter}</span>{/each}</span
      >
    {/each}
  </h1>
  <div class="intro">
    <p class="lead">{profile.intro}</p>
    <Nav currentPath="/" {hasArticles} />
  </div>
</header>

<style>
  .home-header {
    padding: var(--space-3) var(--page-padding) var(--space-5);
    border-bottom: var(--rule-section);
  }

  h1 {
    margin-bottom: var(--space-4);
    /* Close to the fitted size, so the name barely moves when fitText runs */
    font-size: min(10rem, 26vw);
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
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: end;
    gap: var(--space-3);
  }

  .lead {
    max-width: 32ch;
    font-size: var(--type-label);
    font-weight: 500;
    line-height: 1.3;
  }
</style>
