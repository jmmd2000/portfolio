<script lang="ts">
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PageHeader from "$lib/components/layout/PageHeader.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Articles" description="Articles by James Doyle" />

<PageHeader title="Articles" lead="Some things I've written" />

<div class="articles">
  {#each data.articleYears as articleYear (articleYear.year)}
    <section class="year" aria-labelledby="year-{articleYear.year}">
      <h2 id="year-{articleYear.year}">{articleYear.year}</h2>
      <ol>
        {#each articleYear.articles as article (article.slug)}
          <li>
            <a class="article" href={resolve("/(site)/articles/[slug]", { slug: article.slug })}>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <span class="meta">
                <time datetime={article.dateTime}>{article.date}</time>
                <span>{article.readingMinutes} minute read</span>
                {#if article.hasDemo}
                  <span class="demo">Live demo</span>
                {/if}
              </span>
              <span class="arrow" aria-hidden="true">→</span>
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {:else}
    <p>Nothing here yet.</p>
  {/each}
</div>

<style>
  .articles {
    padding: var(--space-3) var(--page-padding) var(--space-5);
    border-bottom: var(--rule-section);
  }

  .year {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
    gap: var(--space-4);
    padding-block: var(--space-4);
    border-bottom: var(--rule-row);

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      border-bottom: 0;
    }
  }

  h2 {
    position: sticky;
    top: var(--space-2);
    align-self: start;
    font-size: var(--type-large);
    font-weight: 900;
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-1) var(--space-3);
    padding-block: var(--space-3);
    border-bottom: var(--rule-row);
    text-decoration: none;

    p,
    .meta {
      grid-column: 1;
    }

    p {
      max-width: 52ch;
    }
  }

  li:first-child .article {
    padding-top: 0;
  }

  li:last-child .article {
    padding-bottom: 0;
    border-bottom: 0;
  }

  h3 {
    font-size: var(--type-medium);
    font-weight: 900;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .demo {
    color: var(--ink);
  }

  .arrow {
    grid-column: 2;
    grid-row: 1;
    font-family: var(--font-display);
    font-size: var(--type-medium);
    font-weight: 900;
    line-height: 1;
    transition:
      transform 250ms var(--ease-out),
      color var(--duration-quick) var(--ease-out);
  }

  .article:focus-visible {
    h3,
    .arrow {
      color: var(--red);
    }
  }

  @media (hover: hover) {
    .article:hover {
      h3,
      .arrow {
        color: var(--red);
      }

      .arrow {
        transform: translateX(0.25em);
      }
    }
  }

  @media (max-width: 47.5rem) {
    .year {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-2);
    }

    h2 {
      position: static;
    }
  }
</style>
