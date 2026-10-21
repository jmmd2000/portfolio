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
  <div class="body">
    <MarkdownContent {html} />
  </div>
</article>

<style>
  header {
    padding: var(--space-4) var(--page-gutter);
    border-bottom: var(--rule-section);
  }

  h1 {
    max-width: 16ch;
    font-size: var(--type-section);
    font-weight: 900;
    line-height: 0.85;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin-top: var(--space-3);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;

    strong {
      color: var(--red-text);
      font-weight: 800;
    }
  }

  .body {
    padding: var(--space-4) var(--page-gutter) var(--space-5);

    > :global(*) {
      margin-inline: auto;
    }
  }
</style>
