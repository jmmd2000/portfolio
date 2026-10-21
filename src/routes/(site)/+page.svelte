<script lang="ts">
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PersonStructuredData from "$lib/components/head/PersonStructuredData.svelte";
  import ArticleRow from "$lib/components/home/ArticleRow.svelte";
  import CurrentlyCards from "$lib/components/home/CurrentlyCards.svelte";
  import ProjectRow from "$lib/components/projects/ProjectRow.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const allProjectsText = $derived(data.projectCount === 1 ? "1 project" : `All ${data.projectCount} projects`);
  const allArticlesText = $derived(data.articleCount === 1 ? "1 article" : `All ${data.articleCount} articles`);
</script>

<PageHead description="James Doyle, a software engineer from Dublin." />
<PersonStructuredData profile={data.profile} socials={data.socials} />

{#if data.featuredProjects.length > 0}
  <section class="home-section" aria-labelledby="projects-heading">
    <h2 class="section-title" id="projects-heading">Projects</h2>
    <ol class="rows">
      {#each data.featuredProjects as project (project.id)}
        <li><ProjectRow {project} /></li>
      {/each}
    </ol>
    <a class="more label" href={resolve("/projects")}>{allProjectsText}</a>
  </section>
{/if}

{#if data.articles.length > 0}
  <section class="home-section" aria-labelledby="writing-heading">
    <h2 class="section-title" id="writing-heading">Writing</h2>
    <ol class="rows">
      {#each data.articles as article (article.slug)}
        <li><ArticleRow {article} /></li>
      {/each}
    </ol>
    <a class="more label" href={resolve("/articles")}>{allArticlesText}</a>
  </section>
{/if}

{#if data.currentlyRows.length > 0}
  <section class="currently-section" aria-label="Currently">
    <CurrentlyCards rows={data.currentlyRows} />
  </section>
{/if}

<style>
  .home-section {
    padding: var(--space-3) var(--page-gutter) var(--space-5);
    border-bottom: var(--rule-section);
  }

  .section-title {
    margin-bottom: var(--space-3);
    color: var(--red);
    font-size: var(--type-section);
    font-weight: 900;
    line-height: 0.85;
  }

  .rows {
    margin: 0;
    padding: 0;
    border-top: var(--rule-row);
    list-style: none;
  }

  .more {
    display: inline-block;
    margin-top: var(--space-3);
    padding-block: var(--space-1);
  }
</style>
