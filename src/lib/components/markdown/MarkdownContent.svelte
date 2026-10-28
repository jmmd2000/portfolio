<script lang="ts">
  import "@fontsource/monaspace-neon/latin-400.css";
  import "@fontsource/monaspace-neon/latin-600.css";

  interface Props {
    /** HTML from renderMarkdown, which has already sanitised it */
    html: string;
  }

  let { html }: Props = $props();
</script>

<div class="markdown">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- renderMarkdown sanitises the HTML on the server -->
  {@html html}
</div>

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

      a:not(.heading-link) {
        text-decoration-thickness: 2px;
      }

      a[rel~="external"]::after {
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

      a[rel~="external"]:focus-visible::after {
        background: var(--red);
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
        background: var(--sunken);
      }

      .code-block {
        margin: var(--space-3) 0;
        background: var(--code-background);
        color: var(--code-foreground);
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

    .markdown :global(a[rel~="external"]:hover::after) {
      background: var(--red);
    }
  }
</style>
