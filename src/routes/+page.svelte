<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PersonStructuredData from "$lib/components/head/PersonStructuredData.svelte";
  import CurrentlyCards from "$lib/components/home/CurrentlyCards.svelte";
  import HomeHeader from "$lib/components/home/HomeHeader.svelte";
  import WorkList from "$lib/components/home/WorkList.svelte";
  import ProjectRow from "$lib/components/projects/ProjectRow.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // A blank line in the bio starts a new paragraph
  const bioParagraphs = $derived(data.profile.bio.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== ""));
</script>

<PageHead description="James Doyle, a software engineer from Dublin." />
<PersonStructuredData profile={data.profile} socials={data.socials} />

<HomeHeader profile={data.profile} />

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
  <section class="band" aria-labelledby="projects-heading">
    <div class="title-row">
      <h2 id="projects-heading">Projects</h2>
      <a href={resolve("/projects")}>All projects</a>
    </div>
    <ul class="projects">
      {#each data.featuredProjects as project (project.id)}
        <li><ProjectRow {project} headingLevel="h3" /></li>
      {/each}
    </ul>
  </section>
{/if}

{#if data.currentlyRows.length > 0}
  <section class="currently" aria-labelledby="currently-heading">
    <h2 id="currently-heading">Currently</h2>
    <CurrentlyCards rows={data.currentlyRows} />
  </section>
{/if}

{#if data.articles.length > 0}
  <section class="articles" aria-labelledby="articles-heading">
    <div class="title-row">
      <h2 id="articles-heading">Articles</h2>
      <a href={resolve("/articles")}>All articles</a>
    </div>
    <ul>
      {#each data.articles as article (article.slug)}
        <li>
          <a class="article" href={resolve("/articles/[slug]", { slug: article.slug })}>
            <strong><span class="words">{article.title}</span> <span class="arrow" aria-hidden="true"><ArrowRight size="1em" strokeWidth={2} /></span></strong>
            <time datetime={article.dateTime}>{article.date}</time>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  h2 {
    margin-bottom: var(--space-5);
  }

  .two-columns {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    gap: var(--space-7);
    padding-block: var(--space-7);
  }

  .bio {
    display: grid;
    gap: var(--space-4);
    max-width: 60ch;
  }

  .after-list {
    margin-top: var(--space-5);
    font-size: var(--font-size-label);

    a {
      font-weight: 500;
    }
  }

  /* The tint runs the full width of the window without making the page scroll sideways */
  .band {
    padding-block: var(--space-7);
    background: var(--colour-tint);
    box-shadow: 0 0 0 100vmax var(--colour-tint);
    clip-path: inset(0 -100vmax);
  }

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-4);
    margin-bottom: var(--space-5);

    h2 {
      margin-bottom: 0;
    }

    a {
      font-size: var(--font-size-label);
      font-weight: 500;
    }
  }

  .projects {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-6);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .currently {
    padding-block: var(--space-7) 0;
  }

  .articles {
    padding-block: var(--space-7) 0;

    ul {
      display: grid;
      gap: var(--space-4);
      max-width: var(--reading-width);
      margin: 0;
      padding: 0;
      list-style: none;
    }
  }

  .article {
    display: block;
    border-radius: var(--radius-medium);
    color: var(--colour-text);
    text-decoration: none;

    strong {
      display: block;
      color: var(--colour-foreground);
      font-weight: 560;
      line-height: 1.35;
    }

    time {
      color: var(--colour-text-muted);
      font-size: var(--font-size-label);
    }

    &:focus-visible {
      outline-offset: 6px;

      .words {
        text-decoration-color: var(--colour-accent);
      }

      .arrow {
        transform: translateX(3px);
        color: var(--colour-accent);
      }
    }
  }

  .words {
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
    transition: text-decoration-color var(--duration-quick) var(--ease-out);
  }

  .arrow {
    display: inline-block;
    color: var(--colour-text-muted);
    vertical-align: -0.125em;
    transition:
      transform 250ms var(--ease-out),
      color 250ms var(--ease-out);
  }

  @media (hover: hover) {
    .article:hover {
      .words {
        text-decoration-color: var(--colour-accent);
      }

      .arrow {
        transform: translateX(3px);
        color: var(--colour-accent);
      }
    }
  }

  @media (max-width: 52rem) {
    .two-columns {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-6);
      padding-block: var(--space-6);
    }

    .band {
      padding-block: var(--space-6);
    }

    .projects {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-5);
    }

    .currently,
    .articles {
      padding-block-start: var(--space-6);
    }
  }
</style>
