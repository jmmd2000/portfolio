<script lang="ts">
  import { statWord } from "$lib/plum/plumMood";
  import type { PlumStats } from "$lib/plum/plumRules";

  interface Props {
    stats: PlumStats;
  }

  let { stats }: Props = $props();

  const rows = $derived([
    { name: "Food", value: stats.food },
    { name: "Happiness", value: stats.happiness },
    { name: "Energy", value: stats.energy },
  ]);
</script>

<dl class="stats">
  {#each rows as row (row.name)}
    <div>
      <dt>{row.name}</dt>
      <dd>
        <span>{statWord(row.value)}</span>
        <span class="meter" aria-hidden="true"><span style:transform="scaleX({row.value / 100})"></span></span>
      </dd>
    </div>
  {/each}
</dl>

<style>
  .stats {
    display: grid;
    gap: var(--space-1);
    max-width: 30rem;
    margin: var(--space-3) 0 0;
    font-weight: 800;

    > div {
      display: grid;
      grid-template-columns: 6.5rem 4.5rem minmax(0, 1fr);
      gap: var(--space-2);
      align-items: center;
    }
  }

  dd {
    display: contents;
  }

  .meter {
    height: 0.75rem;
    overflow: hidden;
    background: var(--red-deep);

    > span {
      display: block;
      height: 100%;
      background: var(--ink);
      transform-origin: left;
      transition: transform var(--duration-lift) var(--ease-out);
    }
  }
</style>
