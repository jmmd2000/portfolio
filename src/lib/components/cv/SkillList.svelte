<script lang="ts">
  import type { SkillCategory } from "$lib/server/content/cv";
  import DotList from "./DotList.svelte";

  interface Props {
    skillCategories: SkillCategory[];
  }

  let { skillCategories }: Props = $props();
</script>

<dl class="skills">
  {#each skillCategories as category (category.id)}
    <div>
      <dt>{category.category}</dt>
      <dd><DotList items={category.items} /></dd>
    </div>
  {/each}
</dl>
<p class="note">Ordered by experience.</p>

<style>
  .skills {
    display: grid;
    gap: var(--space-3);
    margin: 0;

    div {
      display: grid;
      grid-template-columns: 10.5rem minmax(0, 1fr);
      gap: var(--space-4);
    }

    dt {
      color: var(--colour-text-muted);
    }

    dd {
      margin: 0;
      color: var(--colour-foreground);
    }
  }

  .note {
    margin-top: var(--space-4);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  @media (max-width: 36rem) {
    .skills div {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }
</style>
