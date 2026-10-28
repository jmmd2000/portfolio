<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";

  interface Props {
    /** Named in the question and in the confirm button's label, like "Delete SandSim" */
    name: string;
    formaction: string;
    /** As tall as a text field, for a delete button that sits beside one */
    large?: boolean;
    /** A line under the question, like what still uses the thing */
    note?: string;
  }

  let { name, formaction, large = false, note }: Props = $props();

  let details = $state<HTMLDetailsElement>();
  let summary = $state<HTMLElement>();

  // Reads and sets the element's own open state, which changes at once, unlike the toggle event that follows it
  function keep(): void {
    if (details) details.open = false;
    summary?.focus();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || !details?.open) return;

    // Marks Escape as handled, so a panel this sits in stays open
    event.preventDefault();
    keep();
  }
</script>

<!-- A details element asks the question in the row, and opens and closes without JavaScript -->
<details class="confirm-delete" class:large bind:this={details}>
  <summary bind:this={summary} onkeydown={handleKeydown}>Delete</summary>
  <span class="question">
    <span>Delete {name}?</span>
    {#if note}
      <span class="note">{note}</span>
    {/if}
    <Button type="submit" {formaction} variant="destructive" small aria-label="Delete {name}" onkeydown={handleKeydown}>Delete</Button>
    <Button small onclick={keep} onkeydown={handleKeydown}>Keep</Button>
  </span>
</details>

<style>
  details {
    display: inline-block;
    max-width: 100%;
  }

  summary {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.25rem 0.75rem;
    border: var(--rule-row);
    border-color: var(--red-text);
    color: var(--red-text);
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

  /* The same padding and line height as a text field, so it's exactly as tall as one */
  .note {
    flex-basis: 100%;
    color: var(--red-text);
    font-size: var(--type-small);
  }

  .large summary {
    padding: 0.625rem 1.125rem;
    font-size: 1rem;
    line-height: 1.6;
  }

  .question {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    margin-top: var(--space-1);
    padding: var(--space-1);
    background: var(--sunken);
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  @media (hover: hover) {
    summary:hover {
      transform: translate(-2px, -2px);
      box-shadow: 2px 2px 0 var(--red-text);
    }
  }
</style>
