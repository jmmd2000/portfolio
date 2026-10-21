<script lang="ts">
  import type { CurrentlyRow } from "$lib/server/content/currently";

  interface Props {
    rows: CurrentlyRow[];
  }

  let { rows }: Props = $props();

  let failedImageIDs = $state<number[]>([]);
</script>

<ul class="covers">
  {#each rows as row (row.id)}
    <li>
      <svelte:element this={row.url ? "a" : "div"} class="cover" href={row.url ?? undefined} rel={row.url ? "external" : undefined}>
        <span class="frame">
          {#if row.imageURL && !failedImageIDs.includes(row.id)}
            <img src={row.imageURL} alt="Cover of {row.title}" onerror={() => (failedImageIDs = [...failedImageIDs, row.id])} />
          {:else}
            <span class="fallback" aria-hidden="true">{row.title}</span>
          {/if}
        </span>
        <span class="title">{row.title}</span>
        <span class="label">{row.label}</span>
      </svelte:element>
    </li>
  {/each}
</ul>

<style>
  /* Covers keep their own shape (a square album, a tall book) at one shared height, so the titles line up underneath */
  .covers {
    --cover-height: 14rem;

    display: flex;
    flex-wrap: wrap;
    gap: var(--old-space-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cover {
    display: block;
    border-radius: var(--radius-medium);
    color: var(--colour-text);
    text-decoration: none;
  }

  .frame {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: fit-content;
    height: var(--cover-height);
    min-width: 9rem;
    border-radius: var(--radius-medium);
    background: var(--colour-tint);
    box-shadow: var(--shadow-picture);
    transition: transform var(--duration-lift) var(--ease-out);

    img {
      width: auto;
      max-width: none;
      height: var(--cover-height);
    }
  }

  .fallback {
    max-width: 9rem;
    padding: var(--old-space-3);
    color: var(--colour-foreground);
    font-weight: 600;
    text-align: center;
  }

  .title {
    display: block;
    max-width: 12rem;
    margin-top: var(--old-space-3);
    color: var(--colour-foreground);
    font-weight: 560;
    line-height: 1.3;
  }

  .label {
    display: block;
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  a.cover:focus-visible .frame {
    transform: translateY(-4px);
  }

  @media (hover: hover) {
    li:nth-child(odd) a.cover:hover .frame {
      transform: translateY(-4px) rotate(-1.5deg);
    }

    li:nth-child(even) a.cover:hover .frame {
      transform: translateY(-4px) rotate(1.5deg);
    }
  }

  @media (max-width: 52rem) {
    .covers {
      --cover-height: 10rem;

      gap: var(--old-space-4);
    }

    .frame {
      min-width: 6.5rem;
    }
  }
</style>
