<script lang="ts">
  import PageHead from "$lib/components/head/PageHead.svelte";
  import ProjectDisplayList from "$lib/components/projects/ProjectDisplayList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Projects" description="Things James Doyle has built, from a music review site to a falling sand simulation." />

<section>
  <h1>Projects</h1>
  <ProjectDisplayList projects={data.projects} headingLevel="h2" />
</section>

<style>
  section {
    padding-top: var(--space-5);
  }

  h1 {
    margin-bottom: var(--space-5);
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }
</style>
