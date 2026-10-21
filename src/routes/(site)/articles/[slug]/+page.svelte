<script lang="ts">
  import { resolve } from "$app/paths";
  import ArticleView from "$lib/components/articles/ArticleView.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title={data.article.title} description={data.article.summary} noindex={data.article.draft} />

<ArticleView
  title={data.article.title}
  date={data.article.date}
  dateTime={data.article.dateTime}
  readingMinutes={data.article.readingMinutes}
  html={data.html}
  draft={data.article.draft}
  editID={data.article.editID}
/>

<nav class="back" aria-label="More articles">
  <a href={resolve("/articles")}><span>All articles</span><strong>Back to the list</strong></a>
</nav>

<style>
  .back {
    border-top: var(--rule-section);
    border-bottom: var(--rule-section);

    a {
      display: grid;
      gap: var(--space-1);
      padding: var(--space-3) var(--page-gutter);
      text-decoration: none;
    }

    span {
      color: var(--muted);
      font-size: var(--type-small);
      font-weight: 600;
    }

    strong {
      font-family: var(--font-display);
      font-size: var(--type-medium);
      font-weight: 900;
      text-transform: uppercase;
      transition: color var(--duration-quick) var(--ease-out);
    }
  }

  .back a:focus-visible strong {
    color: var(--red);
  }

  @media (hover: hover) {
    .back a:hover strong {
      color: var(--red);
    }
  }
</style>
