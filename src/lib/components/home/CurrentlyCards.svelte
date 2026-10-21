<script lang="ts">
  import type { CurrentlyRow } from "$lib/server/content/currently";

  interface Props {
    rows: CurrentlyRow[];
  }

  let { rows }: Props = $props();

  let failedImageIDs = $state<number[]>([]);
</script>

<ul class="currently">
  {#each rows as row (row.id)}
    <li>
      <svelte:element this={row.url ? "a" : "div"} class="item" href={row.url ?? undefined} rel={row.url ? "external" : undefined}>
        {#if row.imageURL && !failedImageIDs.includes(row.id)}
          <img src={row.imageURL} alt="" loading="lazy" onerror={() => (failedImageIDs = [...failedImageIDs, row.id])} />
        {/if}
        <span>
          <span class="kind">{row.label}</span>
          <strong>{row.title}</strong>
        </span>
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  .currently {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Covers keep their own shape (a square album, a tall book) at one height. The fixed column lines the titles up. */
  .item {
    display: grid;
    grid-template-columns: 4.5rem auto;
    gap: var(--space-2);
    align-items: center;
    text-decoration: none;
  }

  img {
    grid-column: 1;
    width: auto;
    height: 4.5rem;
    outline: var(--rule-row);
  }

  .item > span {
    grid-column: 2;
  }

  .kind {
    display: block;
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  strong {
    display: block;
    font-weight: 700;
  }

  @media (hover: hover) {
    a.item:hover strong {
      color: var(--red);
    }
  }
</style>
