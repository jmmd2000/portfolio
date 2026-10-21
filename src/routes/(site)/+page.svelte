<script lang="ts">
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PersonStructuredData from "$lib/components/head/PersonStructuredData.svelte";
  import ArticleRow from "$lib/components/home/ArticleRow.svelte";
  import CurrentlyCards from "$lib/components/home/CurrentlyCards.svelte";
  import WorkList from "$lib/components/home/WorkList.svelte";
  import ProjectRow from "$lib/components/projects/ProjectRow.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // A blank line in the bio starts a new paragraph
  const bioParagraphs = $derived(data.profile.bio.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== ""));

  const allArticlesText = $derived(data.articleCount === 1 ? "1 article" : `All ${data.articleCount} articles`);
</script>

<PageHead description="James Doyle, a software engineer from Dublin." />
<PersonStructuredData profile={data.profile} socials={data.socials} />

<div class="two-columns">
  <section aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <div class="bio">
      {#each bioParagraphs as paragraph, index (index)}
        <p>{paragraph}</p>
      {/each}
    </div>
  </section>
  <section aria-labelledby="work-heading">
    <h2 id="work-heading">Work</h2>
    <WorkList jobs={data.jobs} />
    <p class="after-list"><a href={resolve("/cv")}>Full CV</a></p>
  </section>
</div>

{#if data.featuredProjects.length > 0}
  <section class="home-section" aria-labelledby="projects-heading">
    <h2 class="section-title" id="projects-heading">Projects</h2>
    <ol class="rows">
      {#each data.featuredProjects as project (project.id)}
        <li><ProjectRow {project} /></li>
      {/each}
    </ol>
    <a class="more label" href={resolve("/projects")}>All projects</a>
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
  <section class="currently" aria-labelledby="currently-heading">
    <h2 id="currently-heading">Currently</h2>
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

  h2 {
    margin-bottom: var(--old-space-5);
  }

  .two-columns {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: var(--old-space-7);
    padding-block: var(--old-space-7);
  }

  .bio {
    display: grid;
    gap: var(--old-space-4);
    max-width: 60ch;
  }

  .after-list {
    margin-top: var(--old-space-5);
    font-size: var(--font-size-label);

    a {
      font-weight: 500;
    }
  }

  .currently {
    padding-block: var(--old-space-8) 0;
  }

  @media (max-width: 52rem) {
    .two-columns {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--old-space-6);
      padding-block: var(--old-space-6);
    }

    .currently {
      padding-block-start: var(--old-space-7);
    }
  }
</style>
