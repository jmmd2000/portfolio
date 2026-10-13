<script lang="ts">
  import { resolve } from "$app/paths";
  import MarkdownContent from "$lib/components/markdown/MarkdownContent.svelte";

  interface Props {
    title: string;
    date: string;
    /** The date as YYYY-MM-DD, for the time element */
    dateTime: string;
    readingMinutes: number;
    /** HTML from renderMarkdown, which has already sanitised it */
    html: string;
    /** Labels the article as a draft, for the signed-in admin viewing it on the site */
    draft?: boolean;
    /** The article's id, for an Edit link. Only the signed-in admin viewing it on the site gets one */
    editID?: number | null;
  }

  let { title, date, dateTime, readingMinutes, html, draft = false, editID = null }: Props = $props();
</script>

<article>
  <header>
    <h1>{title}</h1>
    <p class="meta">
      {#if draft}
        <strong>Draft</strong>
      {/if}
      <time datetime={dateTime}>{date}</time>
      <span>{readingMinutes} minute read</span>
      {#if editID !== null}
        <a href={resolve("/(editor)/admin/articles/[id]", { id: String(editID) })}>Edit</a>
      {/if}
    </p>
  </header>
  <MarkdownContent {html} />
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

    strong {
      color: var(--colour-foreground);
      font-weight: 500;
    }
  }

  @media (max-width: 52rem) {
    header {
      padding-block: var(--space-6) var(--space-5);
    }
  }
</style>
