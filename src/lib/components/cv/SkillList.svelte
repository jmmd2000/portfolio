<script lang="ts">
  import type { SkillCategory } from "$lib/server/content/cv";

  interface Props {
    skillCategories: SkillCategory[];
  }

  let { skillCategories }: Props = $props();
</script>

<dl class="skills">
  {#each skillCategories as category (category.id)}
    <div>
      <dt>{category.category}</dt>
      <dd>{category.items.join(" · ")}</dd>
    </div>
  {/each}
</dl>
<p class="note">Ordered by experience.</p>

<style>
  .skills {
    display: grid;
    gap: var(--space-1);
    margin: 0;
    padding-top: var(--space-3);
    border-top: var(--border-thick) solid var(--colour-foreground);

    div {
      display: grid;
      grid-template-columns: 8.5rem 1fr;
      gap: var(--space-3);
      font-size: var(--font-size-2);
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
    margin-top: var(--space-1);
    color: var(--colour-text-muted);
    font-size: var(--font-size-1);
  }
</style>
