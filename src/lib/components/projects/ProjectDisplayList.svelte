<script lang="ts">
  import type { Project } from "$lib/server/content/projects";
  import ProjectDisplay from "./ProjectDisplay.svelte";

  interface Props {
    projects: Project[];
    headingLevel: "h2" | "h3";
  }

  let { projects, headingLevel }: Props = $props();
</script>

<div class="bands">
  {#each projects as project, index (project.id)}
    <ProjectDisplay {project} {index} {headingLevel} />
  {/each}
</div>

<style>
  .bands {
    display: grid;
    gap: var(--space-3);
  }
</style>
