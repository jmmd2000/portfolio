<script lang="ts">
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PageHeader from "$lib/components/layout/PageHeader.svelte";
  import ProjectDetail from "$lib/components/projects/ProjectDetail.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Projects" description="Things James Doyle has built, from a music review site to a falling sand simulation." />

<PageHeader title="Projects" intro="Things I've built in my own time." />

<ul class="project-list">
  {#each data.projects as project, index (project.id)}
    <li><ProjectDetail {project} headingLevel="h2" imageLoading={index === 0 ? "eager" : "lazy"} writeUpSlug={project.writeUpSlug} /></li>
  {/each}
</ul>

<style>
  .project-list {
    display: grid;
    gap: var(--old-space-8);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (max-width: 52rem) {
    .project-list {
      gap: var(--old-space-7);
    }
  }
</style>
