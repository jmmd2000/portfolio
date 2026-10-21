<script lang="ts">
  import { resolve } from "$app/paths";
  import type { ArticleListItem } from "$lib/server/content/articleList";

  interface Props {
    article: Pick<ArticleListItem, "slug" | "title" | "date" | "dateTime" | "readingMinutes">;
  }

  let { article }: Props = $props();
</script>

<a class="row" href={resolve("/(site)/articles/[slug]", { slug: article.slug })}>
  <h3>{article.title}</h3>
  <span class="details"><time datetime={article.dateTime}>{article.date}</time> · {article.readingMinutes} minute read</span>
  <span class="arrow" aria-hidden="true">→</span>
</a>

<style>
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: var(--space-4);
    align-items: center;
    padding-block: var(--space-3);
    border-bottom: var(--rule-row);
    text-decoration: none;
  }

  h3 {
    font-size: var(--type-medium);
    font-weight: 900;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .details {
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .arrow {
    font-family: var(--font-display);
    font-size: var(--type-medium);
    font-weight: 900;
    line-height: 1;
    transition:
      transform 250ms var(--ease-out),
      color var(--duration-quick) var(--ease-out);
  }

  .row:focus-visible {
    h3,
    .arrow {
      color: var(--red);
    }
  }

  @media (hover: hover) {
    .row:hover {
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
    .row {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--space-1) var(--space-2);
    }

    .details {
      grid-row: 2;
    }

    .arrow {
      grid-row: 1;
      grid-column: 2;
    }
  }
</style>
