<script lang="ts">
  import "@fontsource/monaspace-neon/latin-400.css";
  import "@fontsource/monaspace-neon/latin-600.css";
  import { mountCharts } from "$lib/components/charts/mountCharts";
  import ImageViewer from "./ImageViewer.svelte";

  interface Props {
    /** HTML from renderMarkdown, which has already sanitised it */
    html: string;
  }

  let { html }: Props = $props();

  let viewer = $state<ImageViewer>();

  /** Draws the charts in the HTML, and again whenever the HTML changes */
  function chartsIn(element: HTMLElement): () => void {
    void html;
    return mountCharts(element);
  }

  /** Opens an image's link in the viewer. A click meant for a new tab or window still follows the link */
  function openImage(event: MouseEvent): void {
    if (event.ctrlKey || event.metaKey || event.shiftKey || !(event.target instanceof Element)) return;

    const link = event.target.closest(".image-link");
    const image = link?.querySelector("img");
    if (!link || !image) return;

    event.preventDefault();
    const caption = link.parentElement?.querySelector("figcaption")?.textContent ?? null;
    viewer?.open({ url: image.src, alt: image.alt, caption });
  }
</script>

<!-- The clicks come from links, which Enter also clicks -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="markdown" onclick={openImage} {@attach chartsIn}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown sanitises the HTML on the server -->
  {@html html}
</div>

<ImageViewer bind:this={viewer} />

<style>
  .markdown {
    max-width: 40rem;

    > :global(* + *) {
      margin-top: var(--space-2);
    }

    :global {
      p,
      li {
        font-size: 1.1875rem;
        line-height: 1.65;
      }

      h2,
      h3,
      h4 {
        scroll-margin-top: var(--space-3);
      }

      h2 {
        margin-top: var(--space-5);
        font-size: var(--type-medium);
        font-weight: 900;
      }

      h3 {
        margin-top: var(--space-4);
        font-size: 1.375rem;
      }

      h4 {
        margin-top: var(--space-4);
        font-size: 1.1875rem;
        font-weight: 800;
      }

      .heading-link {
        position: relative;
        color: inherit;
        text-decoration: none;

        /* The empty alt text keeps the mark out of the heading's name for screen readers */
        &::before {
          content: "#" / "";
          position: absolute;
          right: 100%;
          padding-right: 0.3em;
          color: var(--red);
          opacity: 0;
          transition: opacity var(--duration-quick) var(--ease-out);
        }

        &:focus-visible::before {
          opacity: 1;
        }
      }

      a:not(.heading-link, .album-card, .image-link) {
        text-decoration-thickness: 2px;
      }

      a[rel~="external"]:not(.album-card, .image-link)::after {
        content: "";
        display: inline-block;
        width: 0.875em;
        height: 0.875em;
        margin-inline-start: 0.25em;
        background: var(--muted);
        vertical-align: -0.0625em;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 7h10v10'/%3E%3Cpath d='M7 17 17 7'/%3E%3C/svg%3E")
          center / contain no-repeat;
        transition: background var(--duration-quick) var(--ease-out);
      }

      a[rel~="external"]:not(.album-card, .image-link):focus-visible::after {
        background: var(--red);
      }

      .image-link {
        display: block;
        cursor: zoom-in;

        img {
          transition:
            transform var(--duration-quick) var(--ease-out),
            box-shadow var(--duration-quick) var(--ease-out);
        }

        &:focus-visible {
          outline: none;

          img {
            outline: 3px solid var(--red);
            outline-offset: 3px;
            transform: translate(-4px, -4px);
            box-shadow: 4px 4px 0 var(--red);
          }
        }
      }

      figure:not(.code-block) {
        margin: var(--space-3) 0;

        figcaption {
          margin-top: var(--space-1);
          color: var(--muted);
          font-size: var(--type-small);
          font-weight: 600;
        }
      }

      [data-chart] {
        aspect-ratio: var(--figure-ratio);
      }

      .chart-problem,
      [data-chart] {
        color: var(--muted);
        font-size: var(--type-small);
        font-weight: 600;
      }

      .album-card {
        display: grid;
        grid-template-columns: 7rem minmax(0, 1fr);
        gap: var(--space-3);
        align-items: center;
        margin-block: var(--space-3);
        padding: var(--space-2);
        /* The band is close to the dark page's colour, so it needs an edge there */
        border: 2px solid light-dark(transparent, var(--band-ink));
        background: var(--band);
        color: var(--band-ink);
        text-decoration: none;

        & + .album-card {
          margin-top: var(--space-2);
        }

        &:focus-visible .album-card-cover {
          transform: translate(-4px, -4px);
          box-shadow: 4px 4px 0 var(--band-red);
        }

        &:focus-visible .album-card-listen::after {
          transform: translate(2px, -2px);
        }
      }

      .album-card-cover {
        display: block;
        aspect-ratio: 1;
        background: color-mix(in oklch, var(--band-ink) 12%, transparent);
        transition:
          transform var(--duration-quick) var(--ease-out),
          box-shadow var(--duration-quick) var(--ease-out);

        img {
          width: 100%;
          height: 100%;
          outline: none;
          object-fit: cover;
        }
      }

      .album-card-text {
        display: grid;
        gap: 0.25rem;
        min-width: 0;
      }

      .album-card-name {
        font-family: var(--font-display);
        font-size: var(--type-medium);
        font-weight: 900;
        line-height: 0.95;
        text-transform: uppercase;
        text-wrap: balance;
      }

      .album-card-meta {
        color: var(--band-muted);
        font-size: var(--type-small);
        font-weight: 600;
        line-height: 1.4;
      }

      .album-card-listen {
        margin-top: var(--space-1);
        color: var(--band-red);
        font-size: var(--type-small);
        font-weight: 800;
        line-height: 1.4;

        &::after {
          content: "";
          display: inline-block;
          width: 1em;
          height: 1em;
          margin-inline-start: 0.25em;
          background: currentColor;
          vertical-align: -0.125em;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 7h10v10'/%3E%3Cpath d='M7 17 17 7'/%3E%3C/svg%3E")
            center / contain no-repeat;
          transition: transform 250ms var(--ease-out);
        }
      }

      .album-problem {
        padding: var(--space-2);
        border: 2px dashed var(--red-text);
        color: var(--muted);
        font-size: var(--type-small);
        font-weight: 600;
        line-height: 1.5;

        strong {
          display: block;
          color: var(--red-text);
        }

        code {
          display: block;
          padding: 0;
          background: none;
          color: var(--ink);
          overflow-wrap: anywhere;
        }
      }

      strong {
        font-weight: 800;
      }

      ul {
        padding: 0;
        list-style: none;
      }

      ul li {
        position: relative;
        padding-left: 1.25em;

        &::before {
          content: "";
          position: absolute;
          top: 0.65em;
          left: 0;
          width: 0.5em;
          height: 0.5em;
          background: var(--red);
        }
      }

      ol {
        padding-left: 1.5em;
      }

      ol li::marker {
        color: var(--red);
        font-family: var(--font-display);
        font-weight: 900;
      }

      li + li {
        margin-top: var(--space-1);
      }

      blockquote {
        margin: var(--space-4) 0;
        padding-block: var(--space-2);
        border-top: var(--rule-row);
        border-bottom: var(--rule-row);

        p {
          font-family: var(--font-display);
          font-size: var(--type-medium);
          font-weight: 800;
          line-height: 1.05;
          text-transform: uppercase;
        }
      }

      img {
        outline: var(--rule-row);
        filter: var(--filter-picture);
      }

      hr {
        height: 0;
        margin-block: var(--space-5);
        border: 0;
        border-top: var(--rule-row);
      }

      table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        border-collapse: collapse;
      }

      th,
      td {
        padding: var(--space-1) var(--space-2) var(--space-1) 0;
      }

      th {
        border-bottom: var(--rule-row);
        font-family: var(--font-display);
        font-size: 1.125rem;
        font-weight: 800;
        text-transform: uppercase;

        &:not([align]) {
          text-align: start;
        }
      }

      td {
        border-bottom: 1px solid var(--line);
      }

      code {
        font-family: var(--font-code);
        font-size: 0.9em;
      }

      :not(pre) > code {
        padding: 0.1em 0.3em;
        background: var(--red-chip);
        color: white;
      }

      .code-block {
        margin: var(--space-3) 0;
        background: var(--code-background);
        color: var(--code-foreground);
      }

      /* As wide as its longest line, from the text's width up to 64rem, and centred on the text */
      > .code-block {
        position: relative;
        left: 50%;
        width: max-content;
        min-width: 100%;
        max-width: min(64rem, 100cqi);
        translate: -50%;
      }

      .code-block figcaption {
        padding: var(--space-1) var(--space-2);
        border-bottom: 1px solid color-mix(in oklch, var(--code-foreground) 20%, transparent);
        color: var(--code-comment);
        font-size: 0.8125rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      pre {
        margin: 0;
        padding: var(--space-2);
        overflow-x: auto;
        font-size: 0.9375rem;
        line-height: 1.6;
        tab-size: 2;

        code {
          font-size: inherit;
        }
      }

      .keyword {
        color: var(--code-keyword);
      }

      .string {
        color: var(--code-string);
      }

      .constant,
      .type {
        color: var(--code-constant);
      }

      .comment {
        color: var(--code-comment);
        font-style: italic;
      }

      .function {
        font-weight: 600;
      }
    }
  }

  @media (hover: hover) {
    .markdown :global(.heading-link:hover::before) {
      opacity: 1;
    }

    .markdown :global(a[rel~="external"]:not(.album-card, .image-link):hover::after) {
      background: var(--red);
    }

    .markdown :global(.image-link:hover img) {
      transform: translate(-4px, -4px);
      box-shadow: 4px 4px 0 var(--red);
    }

    .markdown :global(.album-card:hover .album-card-cover) {
      transform: translate(-4px, -4px);
      box-shadow: 4px 4px 0 var(--band-red);
    }

    .markdown :global(.album-card:hover .album-card-listen::after) {
      transform: translate(2px, -2px);
    }
  }

  @media (max-width: 47.5rem) {
    .markdown :global(.album-card) {
      grid-template-columns: 5rem minmax(0, 1fr);
      gap: var(--space-2);
    }
  }
</style>
