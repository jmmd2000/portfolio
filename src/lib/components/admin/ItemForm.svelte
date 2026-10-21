<script lang="ts">
  import type { Snippet } from "svelte";
  import { enhance } from "$app/forms";
  import FieldGrid from "$lib/components/form/FieldGrid.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { keepValues } from "$lib/components/form/keepValues";

  interface Props {
    action: string;
    legend: string;
    /** The item's id, sent as a hidden field. Leave it out on a form that adds a new item */
    id?: number;
    /** Clears the fields after a successful submit, for a form that adds a new item */
    resetOnSuccess?: boolean;
    /** Shown under the buttons after this form saves */
    message?: string;
    row?: boolean;
    /** Keeps the legend for screen readers only, for a form whose name already shows above it */
    hideLegend?: boolean;
    /** Marks the form that adds a new item, with a dashed box */
    add?: boolean;
    children: Snippet;
    actions: Snippet;
  }

  let { action, legend, id, resetOnSuccess = false, message, row = false, hideLegend = false, add = false, children, actions }: Props = $props();
</script>

<form method="POST" {action} class:row class:hidden-legend={hideLegend} class:add use:enhance={resetOnSuccess ? undefined : keepValues}>
  <fieldset>
    <legend>{legend}</legend>
    {#if id !== undefined}
      <input type="hidden" name="id" value={id} />
    {/if}
    <div class="fields">
      <FieldGrid>
        {@render children()}
      </FieldGrid>
    </div>
    <div class="actions">
      {@render actions()}
    </div>
    {#if message}
      <div class="message">
        <FormMessage status="success">{message}</FormMessage>
      </div>
    {/if}
  </fieldset>
</form>

<style>
  form {
    width: 100%;
    max-width: 48rem;
  }

  .add {
    padding: var(--space-3);
    border: 2px dashed var(--ink);
  }

  fieldset {
    display: grid;
    gap: var(--space-2);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    margin-bottom: var(--space-2);
    padding: 0;
    font-family: var(--font-display);
    font-size: var(--type-label);
    font-weight: 800;
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
  }

  .message {
    justify-self: start;
  }

  .hidden-legend legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .row {
    @media (min-width: 48rem) {
      max-width: none;

      fieldset {
        grid-template-columns: 1fr auto;
        align-items: start;
      }

      /* The height of a field's label and gap, so the buttons line up with the inputs even when a field shows an error */
      .actions {
        margin-top: 1.6rem;
      }

      .message {
        grid-column: 1 / -1;
      }

      .fields > :global(.field-grid) {
        grid-template-columns: none;
        grid-auto-columns: 1fr;
        grid-auto-flow: column;
      }
    }
  }
</style>
