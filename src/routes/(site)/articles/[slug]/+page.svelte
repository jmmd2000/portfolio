<script lang="ts">
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
