<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    name: string;
    open?: boolean;
    children: Snippet;
    /** Shown beside the name, so they work while the fold is closed */
    buttons?: Snippet;
    /** Marks the fold that adds a new item, with a dashed box */
    add?: boolean;
  }

  let { name, open = false, children, buttons, add = false }: Props = $props();
</script>

<div class="fold" class:has-buttons={buttons} class:add>
  <details {open}>
    <summary>{name}</summary>
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
    border-bottom: 1px solid var(--line);
  }

  .add {
    margin-top: var(--space-3);
    padding-inline: var(--space-2);
    border: 2px dashed var(--ink);
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding-bottom: var(--space-2);
  }

  /* On a wide screen the buttons sit in the summary's row, on top of the details, so the open form below keeps the full width */
  @media (min-width: 40rem) {
    .fold {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
    }

    details {
      grid-row: 1;
      grid-column: 1 / -1;
    }

    .buttons {
      grid-row: 1;
      grid-column: 2;
      justify-content: end;
      max-width: 18rem;
      padding-block: var(--space-2);
    }

    .has-buttons summary {
      padding-right: 18rem;
    }
  }

  summary {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--space-2);
    min-height: 3.5rem;
    padding-block: var(--space-1);
    font-size: 1.125rem;
    font-weight: 700;
    list-style: none;
    overflow-wrap: anywhere;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }

    &::before {
      content: "+" / "";
      display: grid;
      place-items: center;
      width: 1.75rem;
      height: 1.75rem;
      border: var(--rule-row);
      font-weight: 800;
      line-height: 1;
    }
  }

  details[open] > summary::before {
    content: "\2212" / "";
  }

  .content {
    padding: var(--space-1) 0 var(--space-3) calc(1.75rem + var(--space-2));
  }

  @media (max-width: 40rem) {
    .content {
      padding-left: 0;
    }
  }
</style>
