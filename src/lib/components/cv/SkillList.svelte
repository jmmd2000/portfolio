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
    margin: 0;

    div {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
      gap: var(--space-1) var(--space-4);
      padding-block: var(--space-2);
      break-inside: avoid;
    }

    div + div {
      border-top: 1px solid var(--line);
    }

    dt {
      font-family: var(--font-display);
      font-size: var(--type-label);
      font-weight: 800;
      text-transform: uppercase;
    }

    dd {
      align-self: center;
      margin: 0;
    }
  }

  .note {
    margin-top: var(--space-2);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  @media (max-width: 47.5rem) {
    .skills div {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media print {
    .skills {
      break-inside: avoid;
    }

    .skills div {
      grid-template-columns: 11rem minmax(0, 1fr);
      gap: var(--space-2);
      padding-block: 0.25rem;
    }

    .note {
      margin-top: var(--space-1);
    }
  }
</style>
