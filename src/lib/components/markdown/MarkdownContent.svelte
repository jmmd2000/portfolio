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
    max-width: var(--reading-width);
    font-size: var(--font-size-summary);

    > :global(* + *) {
      margin-top: var(--space-5);
    }

    :global {
      h2,
      h3,
      h4 {
        scroll-margin-top: var(--space-6);
      }

      .heading-link {
        color: inherit;
        text-decoration-color: transparent;
        transition: text-decoration-color var(--duration-quick) var(--ease-out);

        /* The empty alt text keeps the mark out of the heading's name for screen readers */
        &::after {
          content: "#" / "";
          margin-inline-start: 0.35em;
          color: var(--colour-accent);
          font-weight: 500;
        }

        &:focus-visible {
          text-decoration-color: var(--colour-accent);
        }
      }

      h2 {
        margin-top: var(--space-7);
      }

      h3 {
        margin-top: var(--space-6);
        font-size: var(--font-size-title);
      }

      h4 {
        margin-top: var(--space-6);
        font-size: var(--font-size-summary);
        font-weight: 600;
        font-stretch: 100%;
      }

      ul,
      ol {
        padding-inline-start: 1.25rem;
      }

      li {
        padding-inline-start: var(--space-1);
      }

      li + li {
        margin-top: var(--space-2);
      }

      li::marker {
        color: var(--colour-text-muted);
      }

      blockquote {
        margin-inline: 0;
        padding: var(--space-4) var(--space-5);
        border-radius: var(--radius-medium);
        background: var(--colour-tint);
        color: var(--colour-foreground);
      }

      a[rel~="external"]::after {
        content: "";
        display: inline-block;
        width: 0.875em;
        height: 0.875em;
        margin-inline-start: 0.25em;
        background: var(--colour-text-muted);
        vertical-align: -0.0625em;
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 7h10v10'/%3E%3Cpath d='M7 17 17 7'/%3E%3C/svg%3E")
          center / contain no-repeat;
        transition: background var(--duration-quick) var(--ease-out);
      }

      img {
        border-radius: var(--radius-medium);
        box-shadow: var(--shadow-picture);
        filter: var(--filter-picture);
      }

      hr {
        border: 0;
        margin-block: var(--space-6);
        color: var(--colour-text-muted);
        text-align: center;

        &::after {
          content: "· · ·";
          letter-spacing: 0.5em;
        }
      }

      table {
        display: block;
        max-width: 100%;
        overflow-x: auto;
        border-collapse: collapse;
        font-size: var(--font-size-body);
      }

      th,
      td {
        padding: var(--space-2) var(--space-4) var(--space-2) 0;
        border-bottom: 1px solid var(--colour-divider);
      }

      th {
        color: var(--colour-foreground);
        font-weight: 600;

        &:not([align]) {
          text-align: start;
        }
      }

      code {
        font-family: var(--font-code);
        font-size: var(--font-size-code);
      }

      :not(pre) > code {
        padding: 0.1em 0.35em;
        border-radius: var(--radius-small);
        background: var(--colour-surface);
        color: var(--colour-foreground);
      }

      .code-block {
        margin-inline: 0;
        overflow: hidden;
        border-radius: var(--radius-large);
        background: var(--colour-surface);
      }

      .code-block figcaption {
        padding: var(--space-2) var(--space-4);
        border-bottom: 1px solid var(--colour-divider);
        color: var(--colour-text-muted);
        font-size: var(--font-size-label);
      }

      pre {
        margin: 0;
        padding: var(--space-4);
        overflow-x: auto;
        color: var(--colour-text);
        line-height: 1.65;
        tab-size: 2;

        &:focus-visible {
          outline: 2px solid var(--colour-accent);
          outline-offset: -2px;
        }
      }

      .keyword {
        color: var(--colour-foreground);
        font-weight: 600;
      }

      .comment {
        color: var(--colour-text-muted);
      }

      .string {
        color: var(--colour-code-string);
      }

      .constant {
        color: var(--colour-code-constant);
      }

      .function {
        color: var(--colour-code-function);
      }

      .type {
        color: var(--colour-code-type);
      }
    }
  }

  @media (hover: hover) {
    .markdown :global(a[rel~="external"]:hover::after) {
      background: var(--colour-accent);
    }

    .markdown :global(.heading-link:hover) {
      text-decoration-color: var(--colour-accent);
    }
  }

  .markdown :global(a[rel~="external"]:focus-visible::after) {
    background: var(--colour-accent);
  }
</style>
