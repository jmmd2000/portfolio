<script lang="ts">
  import type { ShownCurrentlyRow } from "./nowPlayingRow";

  interface Props {
    rows: ShownCurrentlyRow[];
  }

  let { rows }: Props = $props();

  // Keyed by address, so a broken Spotify cover doesn't also hide the row's saved cover
  let failedImageURLs = $state<string[]>([]);
</script>

<ol class="currently">
  {#each rows as row (row.id)}
    <li>
      <svelte:element this={row.url ? "a" : "div"} class="row" href={row.url ?? undefined} rel={row.url ? "external" : undefined}>
        <span class="kind label">
          {#if row.live}
            <svg class="bars" viewBox="0 0 16 14" aria-hidden="true">
              <rect x="0" y="4" width="3" height="10" />
              <rect x="4.33" y="0" width="3" height="14" />
              <rect x="8.66" y="6" width="3" height="8" />
              <rect x="13" y="2" width="3" height="12" />
            </svg>
          {/if}
          {row.label}
        </span>
        <span class="cover">
          {#if row.imageURL && !failedImageURLs.includes(row.imageURL)}
            {@const imageURL = row.imageURL}
            <img src={imageURL} alt="" loading="lazy" onerror={() => (failedImageURLs = [...failedImageURLs, imageURL])} />
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--red-text);
  }

  .bars {
    flex: none;
    width: 1rem;
    height: 0.875rem;
    fill: currentColor;

    rect {
      transform-box: fill-box;
      transform-origin: bottom;
      transition: transform 250ms var(--ease-out);
    }
  }

  /* The bars only change when the visitor points at or focuses the row */
  @media (prefers-reduced-motion: no-preference) {
    a.row:focus-visible .bars {
      rect:nth-child(odd) {
        transform: scaleY(0.5);
      }

      rect:nth-child(even) {
        transform: scaleY(1.15);
      }
    }
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    a.row:hover .bars {
      rect:nth-child(odd) {
        transform: scaleY(0.5);
      }

      rect:nth-child(even) {
        transform: scaleY(1.15);
      }
    }
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
