<script lang="ts">
  import { resolve } from "$app/paths";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import MarkdownContent from "$lib/components/markdown/MarkdownContent.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title={data.article.title} description={data.article.summary} />

<article>
  <header>
    <h1>{data.article.title}</h1>
    <p class="meta">
      <time datetime={data.article.dateTime}>{data.article.date}</time>
      <span>{data.article.readingMinutes} minute read</span>
      {#if data.article.project}
        <span>Write-up for <a href="{resolve('/projects')}#project-{data.article.project.id}">{data.article.project.title}</a></span>
      {/if}
    </p>
  </header>
  <MarkdownContent html={data.html} />
</article>

<style>
  header {
    max-width: var(--reading-width);
    padding-block: var(--space-7) var(--space-6);
  }

  h1 {
    font-size: var(--font-size-page-title);
    line-height: 1.1;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    margin-top: var(--space-4);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);

    > * {
      white-space: nowrap;
    }

    a {
      font-weight: 500;
    }
  }

  @media (max-width: 52rem) {
    header {
      padding-block: var(--space-6) var(--space-5);
    }
  }
</style>
