<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    /** The icon before the label on the button that opens the panel */
    icon: Snippet;
    children: Snippet;
  }

  let { label, icon, children }: Props = $props();

  let details = $state<HTMLDetailsElement>();
  let summary = $state<HTMLElement>();

  // Reads and sets the element's own open state, which changes at once, unlike the toggle event that follows it
  function close(): void {
    if (details) details.open = false;
    summary?.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    // Escape that something inside the panel already handled leaves the panel open
    if (event.key !== "Escape" || !details?.open || event.defaultPrevented) return;

    close();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<details bind:this={details}>
  <summary bind:this={summary}>{@render icon()} {label}</summary>
  <div class="panel">
    <div class="heading">
      <h2>{label}</h2>
      <button class="close" type="button" aria-label="Close the {label.toLowerCase()} panel" onclick={close}><X size="1.25em" aria-hidden="true" /></button>
    </div>
    {@render children()}
  </div>
</details>

<style>
  summary {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.75rem;
    border: var(--rule-row);
    font-size: 0.9375rem;
    font-weight: 700;
    list-style: none;
    cursor: pointer;
    transition:
      transform var(--duration-quick) var(--ease-out),
      box-shadow var(--duration-quick) var(--ease-out);

    &::-webkit-details-marker {
      display: none;
    }
  }

  details[open] summary {
    background: var(--ink);
    color: var(--paper);
  }

  .panel {
    position: fixed;
    inset: 0 0 0 auto;
    z-index: 10;
    display: grid;
    align-content: start;
    gap: var(--space-2);
    width: min(26rem, 100%);
    padding: var(--space-2) var(--space-3) var(--space-4);
    overflow-y: auto;
    border-left: var(--rule-section);
    background: var(--paper);
  }

  .heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--space-1);
    border-bottom: var(--rule-row);

    h2 {
      font-size: var(--type-medium);
      font-weight: 900;
    }
  }

  .close {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);
  }

  @media (hover: hover) {
    details:not([open]) summary:hover {
      transform: translate(-2px, -2px);
      box-shadow: 2px 2px 0 var(--ink);
    }

    .close:hover {
      color: var(--red);
    }
  }
</style>
