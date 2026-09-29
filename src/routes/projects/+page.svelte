<script lang="ts">
  import ProjectDisplayList from "$lib/components/projects/ProjectDisplayList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

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
