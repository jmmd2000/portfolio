<script lang="ts">
  import { linkText } from "$lib/components/contact/linkText";
  import type { Project } from "$lib/server/content/projects";
  import BulletList from "./BulletList.svelte";
  import CVEntry from "./CVEntry.svelte";
  import DotList from "./DotList.svelte";

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();

  function linkFor(project: Project): string | null {
    return project.liveURL ?? project.sourceURL;
  }
</script>

<div class="entries">
  {#each projects as project (project.id)}
    {@const url = linkFor(project)}
    <CVEntry period={project.year === null ? "" : String(project.year)} place={url === null ? null : linkText(url)} placeURL={url}>
      <h3>{project.title}</h3>
      {#if project.highlights.length > 0}
        <BulletList items={project.highlights} />
      {:else}
        <p class="description">{project.description}</p>
      {/if}
      {#if project.stack.length > 0}
        <p class="tags"><DotList items={project.stack} /></p>
      {/if}
    </CVEntry>
  {/each}
</div>

<style>
  .entries > :global(* + *) {
    border-top: var(--rule-row);
  }

  h3 {
    font-size: var(--type-medium);
    font-weight: 900;
  }

  .description {
    margin-top: var(--space-1);
  }

  .tags {
    margin-top: var(--space-2);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }
</style>
