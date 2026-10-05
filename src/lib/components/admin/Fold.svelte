<script lang="ts">
  import type { Snippet } from "svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";

  interface Props {
    name: string;
    open?: boolean;
    children: Snippet;
    /** Shown beside the name, so they work while the fold is closed */
    buttons?: Snippet;
  }

  let { name, open = false, children, buttons }: Props = $props();
</script>

<div class="fold" class:has-buttons={buttons}>
  <details {open}>
    <summary><ChevronDown /> {name}</summary>
    <div class="content">
      {@render children()}
    </div>
  </details>
  {#if buttons}
    <div class="buttons">{@render buttons()}</div>
  {/if}
</div>

<style>
  .fold {
    display: grid;
    width: 100%;
    max-width: 48rem;
    border-bottom: var(--border-thin) solid var(--colour-divider);
  }

  .buttons {
    display: flex;
    gap: var(--space-2);
    padding-bottom: var(--space-3);
  }

  /* On a wide screen the buttons sit in the summary's row, on top of the details, so the open form below keeps the full width */
  @media (min-width: 40rem) {
    .fold {
      grid-template-columns: 1fr auto;
      align-items: start;
    }

    details {
      grid-row: 1;
      grid-column: 1 / -1;
    }

    .buttons {
      grid-row: 1;
      grid-column: 2;
      padding-block: var(--space-2);
    }

    .has-buttons summary {
      padding-right: 12rem;
    }
  }

  summary {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 4.5rem;
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-5);
    font-weight: 700;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }

    :global(svg) {
      flex: none;
      transition: rotate var(--duration-quick) var(--ease-out);
    }
  }

  details[open] summary :global(svg) {
    rotate: 180deg;
  }

  .content {
    padding-bottom: var(--space-5);
  }
</style>
