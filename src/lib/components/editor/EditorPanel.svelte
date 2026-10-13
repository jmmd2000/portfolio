<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    open?: boolean;
    /** The icon before the label in the top bar */
    icon: Snippet;
    children: Snippet;
  }

  let { label, open = $bindable(false), icon, children }: Props = $props();

  let summary = $state<HTMLElement>();

  function handleKeydown(event: KeyboardEvent): void {
    // Escape in a dialog, such as the delete confirm, closes only the dialog
    const inDialog = event.target instanceof Element && event.target.closest("dialog") !== null;
    if (event.key !== "Escape" || !open || inDialog) return;

    open = false;
    summary?.focus();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Every panel shares a name, so the browser closes the open one when another opens -->
<details name="editor-panel" bind:open>
  <summary bind:this={summary}>{@render icon()} <span class="label">{label}</span></summary>
  <div class="panel">
    <div class="heading">
      <h2>{label}</h2>
      <button class="close" type="button" aria-label="Close the {label.toLowerCase()} panel" onclick={() => (open = false)}><X size="1.25em" aria-hidden="true" /></button>
    </div>
    {@render children()}
  </div>
</details>

<style>
  summary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2);
    border-radius: var(--radius-medium);
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
    font-weight: 500;
    list-style: none;
    cursor: pointer;

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      background: var(--colour-surface);
    }
  }

  details[open] summary {
    background: var(--colour-surface);
  }

  .panel {
    position: fixed;
    inset: var(--bar-height) 0 0 auto;
    z-index: 10;
    display: grid;
    align-content: start;
    gap: var(--space-4);
    width: min(24rem, 100%);
    padding: var(--space-5);
    overflow-y: auto;
    border-left: 1px solid var(--colour-divider);
    background: var(--colour-background);
    box-shadow: -24px 0 48px -32px var(--colour-shadow);
  }

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      font-size: var(--font-size-title);
    }
  }

  .close {
    display: grid;
    place-items: center;
    padding: var(--space-1);
    border: 0;
    border-radius: var(--radius-medium);
    background: transparent;
    color: var(--colour-text-muted);
    cursor: pointer;

    &:hover {
      background: var(--colour-surface);
      color: var(--colour-foreground);
    }
  }

  @media (max-width: 40rem) {
    /* Only the icon shows, and screen readers still hear the word */
    .label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  @media (max-width: 22.5rem) {
    summary {
      padding-inline: var(--space-1);
    }
  }
</style>
