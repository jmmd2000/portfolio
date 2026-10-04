<script lang="ts">
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PersonStructuredData from "$lib/components/head/PersonStructuredData.svelte";
  import CurrentlyCards from "$lib/components/home/CurrentlyCards.svelte";
  import HomeHeader from "$lib/components/home/HomeHeader.svelte";
  import ProjectDisplayList from "$lib/components/projects/ProjectDisplayList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead description="James Doyle, a software engineer from Dublin." />
<PersonStructuredData profile={data.profile} socials={data.socials} />

<HomeHeader profile={data.profile} />

<p class="intro">{data.profile.bio}</p>

{#if data.currentlyRows.length > 0}
  <section aria-labelledby="currently-heading">
    <h2 id="currently-heading">Currently</h2>
    <CurrentlyCards rows={data.currentlyRows} />
  </section>
{/if}

<section>
  <h2>Projects</h2>
  <ProjectDisplayList projects={data.featuredProjects} headingLevel="h3" />
  <a class="all-projects" href={resolve("/projects")}>All {data.publishedCount} {data.publishedCount === 1 ? "project" : "projects"}</a>
</section>

<style>
  .intro {
    max-width: 62ch;
    margin-top: var(--space-6);
    font-size: var(--font-size-4);
  }

  section {
    margin-top: clamp(var(--space-7), 8vw, var(--space-8));
  }

  h2 {
    margin-bottom: var(--space-4);
  }

  .all-projects {
    display: inline-block;
    margin-top: var(--space-4);
    padding: var(--space-1) var(--space-2);
    border: var(--border-thick) solid var(--colour-foreground);
    background: var(--colour-background);
    color: var(--colour-foreground);
    font-size: var(--font-size-2);
    font-weight: 600;
    text-decoration: none;
    transition:
      background var(--duration-quick) var(--ease-out),
      color var(--duration-quick) var(--ease-out);

    &:hover {
      background: var(--colour-foreground);
      color: var(--colour-background);
    }
  }
</style>
