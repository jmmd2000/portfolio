<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    /** When it happened, shown in red, like "July 2023 to now". Left out when empty */
    period: string;
    /** Where it happened, under the period */
    place?: string | null;
    /** Turns the place into a link */
    placeURL?: string | null;
    children: Snippet;
  }

  let { period, place = null, placeURL = null, children }: Props = $props();
</script>

<article class="entry">
  <div class="when">
    {#if period}
      <strong>{period}</strong>
    {/if}
    {#if place && placeURL}
      <a href={placeURL} rel="external">{place}</a>
    {:else if place}
      <span>{place}</span>
    {/if}
  </div>
  <div>
    {@render children()}
  </div>
</article>

<style>
  .entry {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
    gap: var(--space-1) var(--space-4);
    padding-block: var(--space-3);
    break-inside: avoid;
  }

  .when {
    display: grid;
    align-content: start;
    gap: 0.25rem;
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;

    strong {
      color: var(--red);
      font-family: var(--font-display);
      font-size: var(--type-label);
      font-weight: 800;
      text-transform: uppercase;
    }

    a {
      justify-self: start;
      color: var(--ink);
      overflow-wrap: anywhere;
    }
  }

  @media (max-width: 47.5rem) {
    .entry {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media print {
    .entry {
      grid-template-columns: 11rem minmax(0, 1fr);
      gap: var(--space-2);
      padding-block: var(--space-1);
    }

    .when a {
      text-decoration: none;
    }
  }
</style>
