<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PageHeader from "$lib/components/layout/PageHeader.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Articles" description="Articles by James Doyle" />

<PageHeader title="Articles" intro="Some things I've written" />

{#each data.articleYears as articleYear (articleYear.year)}
  <section class="year-group" aria-labelledby="year-{articleYear.year}">
    <h2 class="year" id="year-{articleYear.year}">{articleYear.year}</h2>
    <ul class="articles">
      {#each articleYear.articles as article (article.slug)}
        <li>
          <a class="article" href={resolve("/(site)/articles/[slug]", { slug: article.slug })}>
            <h3 class="title"><span class="words">{article.title}</span> <span class="arrow" aria-hidden="true"><ArrowRight size="1em" strokeWidth={2} /></span></h3>
            <span class="summary">{article.summary}</span>
            <span class="meta">
              <time datetime={article.dateTime}>{article.date}</time>
              <span>{article.readingMinutes} minute read</span>
              {#if article.hasDemo}
                <span>Live demo</span>
              {/if}
              {#if article.projectTitle}
                <span>Write-up for {article.projectTitle}</span>
              {/if}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{:else}
  <p class="empty">Nothing here yet.</p>
{/each}

<style>
  .year-group {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr);
    gap: var(--space-5);

    & + & {
      margin-top: var(--space-7);
    }
  }

  .year {
    color: var(--colour-text-muted);
    font-size: var(--font-size-title);
    font-weight: 600;
    line-height: 1.35;
  }

  .articles {
    display: grid;
    gap: var(--space-6);
    max-width: var(--reading-width);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .article {
    display: block;
    border-radius: var(--radius-medium);
    color: var(--colour-text);
    text-decoration: none;

    &:focus-visible {
      outline-offset: 8px;
    }
  }

  .title {
    font-size: var(--font-size-title);
    font-weight: 600;
    line-height: 1.35;
  }

  .words {
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
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

  .summary {
    display: block;
    max-width: 60ch;
    margin-top: var(--space-1);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    margin-top: var(--space-2);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);

    > * {
      white-space: nowrap;
    }
  }

  .article:focus-visible {
    .words {
      text-decoration-color: var(--colour-accent);
    }

    .arrow {
      transform: translateX(3px);
      color: var(--colour-accent);
    }
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

  .empty {
    max-width: 60ch;
    color: var(--colour-foreground);
    font-size: var(--font-size-summary);
  }

  @media (max-width: 52rem) {
    .year-group {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-3);
    }
  }
</style>
