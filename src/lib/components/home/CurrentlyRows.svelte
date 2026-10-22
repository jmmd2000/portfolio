<script lang="ts">
  import type { CurrentlyRow } from "$lib/server/content/currently";

  interface Props {
    rows: CurrentlyRow[];
  }

  let { rows }: Props = $props();

  let failedImageIDs = $state<number[]>([]);
</script>

<ol class="currently">
  {#each rows as row (row.id)}
    <li>
      <svelte:element this={row.url ? "a" : "div"} class="row" href={row.url ?? undefined} rel={row.url ? "external" : undefined}>
        <span class="kind label">{row.label}</span>
        <span class="cover">
          {#if row.imageURL && !failedImageIDs.includes(row.id)}
            <img src={row.imageURL} alt="" loading="lazy" onerror={() => (failedImageIDs = [...failedImageIDs, row.id])} />
          {/if}
        </span>
        <span class="text">
          <strong>{row.title}</strong>
          {#if row.subtitle}<span class="subtitle">{row.subtitle}</span>{/if}
        </span>
      </svelte:element>
    </li>
  {/each}
</ol>

<style>
  .currently {
    margin: 0;
    padding: 0;
    list-style: none;

    > li + li {
      border-top: var(--rule-row);
    }
  }

  .row {
    display: grid;
    grid-template-columns: 9rem 5rem minmax(0, 1fr);
    gap: var(--space-3);
    align-items: center;
    padding-block: var(--space-2);
    text-decoration: none;
  }

  .kind {
    color: var(--red-text);
  }

  /* Covers keep their own shape (a square album, a tall book) at one height, centred in a fixed column */
  .cover {
    display: flex;
    justify-content: center;
  }

  img {
    display: block;
    width: auto;
    height: 5rem;
    outline: var(--rule-row);
  }

  strong {
    display: block;
    font-family: var(--font-display);
    font-size: var(--type-medium);
    font-weight: 900;
    line-height: 0.95;
    text-transform: uppercase;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .subtitle {
    display: block;
    margin-top: var(--space-1);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  a.row:focus-visible strong {
    color: var(--red);
  }

  @media (hover: hover) {
    a.row:hover strong {
      color: var(--red);
    }
  }

  @media (max-width: 47.5rem) {
    .row {
      grid-template-columns: 4rem minmax(0, 1fr);
      gap: var(--space-1) var(--space-2);
    }

    .kind {
      grid-row: 1;
      grid-column: 2;
      font-size: var(--type-small);
    }

    .cover {
      grid-row: 1 / span 2;
      grid-column: 1;
    }

    img {
      height: 4rem;
    }

    .text {
      grid-row: 2;
      grid-column: 2;
    }
  }
</style>
