<script lang="ts">
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PageHeader from "$lib/components/layout/PageHeader.svelte";
  import ProjectDetail from "$lib/components/projects/ProjectDetail.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Projects" description="Things James Doyle has built, from a music review site to a falling sand simulation." />

<PageHeader title="Projects" lead="Things I've built in my own time." />

<div class="projects">
  <ol class="project-list">
    {#each data.projects as project, index (project.id)}
      <li><ProjectDetail {project} headingLevel="h2" imageLoading={index === 0 ? "eager" : "lazy"} /></li>
    {/each}
  </ol>
</div>

<style>
  .projects {
    padding: var(--space-3) var(--page-gutter) var(--space-5);
    border-bottom: var(--rule-section);
  }

  .project-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
