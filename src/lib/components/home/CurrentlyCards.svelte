<script lang="ts">
  import type { CurrentlyRow } from "$lib/server/content/currently";

  interface Props {
    rows: CurrentlyRow[];
  }

  let { rows }: Props = $props();

  const colours = ["ink", "deep", "plain", "flare"] as const;
</script>

<ul class="cards count-{rows.length}">
  {#each rows as row, index (row.id)}
    <li>
      <svelte:element this={row.url ? "a" : "div"} class="card {colours[index]}" href={row.url ?? undefined} rel={row.url ? "external" : undefined}>
        {#if row.imageURL}
          <img src={row.imageURL} alt="Cover of {row.title}" />
        {/if}
        <span class="words">
          <span class="label">{row.label}</span>
          <span class="title">{row.title}</span>
          {#if row.subtitle}<span class="subtitle">{row.subtitle}</span>{/if}
        </span>
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  .cards {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* On a phone the cards stack, the first one taller */
  li {
    height: 6.5rem;
    min-height: 0;

    &:first-child {
      height: 10rem;
    }
  }

  @media (min-width: 40rem) {
    li,
    li:first-child {
      height: auto;
    }

    .count-1 {
      grid-template-rows: 16rem;
    }

    .count-2 {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 16rem;
    }

    /* With three or four, the first card fills the left half and the rest stack evenly on the right */
    .count-3,
    .count-4 {
      grid-auto-flow: column;
      grid-template-columns: 1fr 1fr;
      height: 21rem;

      li:first-child {
        grid-row: 1 / -1;
      }
    }

    .count-3 {
      grid-template-rows: 1fr 1fr;
    }

    .count-4 {
      grid-template-rows: 1fr 1fr 1fr;
    }
  }

  /* Every card is wider than it's tall, so a cover always fills the height and the words take the width that's left */
  .card {
    container-type: size;
    display: flex;
    height: 100%;
    color: inherit;
    text-decoration: none;
  }

  img {
    flex: none;
    width: auto;
    height: 100%;
  }

  .words {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-end;
    gap: 0.2rem;
    min-width: 0;
    padding: clamp(0.75rem, 9cqh, 2rem) clamp(0.75rem, 5cqw, 2rem);
  }

  .label,
  .subtitle {
    font-size: var(--font-size-2);
    opacity: 0.8;
  }

  .title {
    font-family: var(--font-display);
    font-size: clamp(1.1rem, min(14cqh, 6cqw), 2.75rem);
    font-weight: 800;
    font-stretch: 92%;
    letter-spacing: -0.03em;
    line-height: 0.95;
  }

  @container (height < 7rem) {
    .subtitle {
      display: none;
    }
  }

  .ink {
    background: var(--colour-foreground);
    color: var(--colour-text-on-foreground);
  }

  .deep {
    background: var(--colour-teal);
    color: var(--colour-text-on-teal);
  }

  .plain {
    border: var(--border-thick) solid var(--colour-foreground);
    background: var(--colour-panel);
    color: var(--colour-foreground);
  }

  .flare {
    background: var(--colour-orange);
    color: var(--colour-text-on-orange);
  }

  a.card img {
    transition: opacity var(--duration-quick) var(--ease-out);
  }

  a.card:hover img {
    opacity: 0.85;
  }
</style>
