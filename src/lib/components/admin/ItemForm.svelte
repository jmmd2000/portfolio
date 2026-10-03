<script lang="ts">
  import type { Snippet } from "svelte";
  import { enhance } from "$app/forms";
  import { keepValues } from "$lib/components/form/keepValues";

  interface Props {
    action: string;
    legend: string;
    /** The item's id, sent as a hidden field. Leave it out on a form that adds a new item */
    id?: number;
    /** Clears the fields after a successful submit, for a form that adds a new item */
    resetOnSuccess?: boolean;
    children: Snippet;
    actions: Snippet;
  }

  let { action, legend, id, resetOnSuccess = false, children, actions }: Props = $props();
</script>

<form method="POST" {action} use:enhance={resetOnSuccess ? undefined : keepValues}>
  <fieldset>
    <legend>{legend}</legend>
    {#if id !== undefined}
      <input type="hidden" name="id" value={id} />
    {/if}
    <div class="fields">
      {@render children()}
    </div>
    <div class="actions">
      {@render actions()}
    </div>
  </fieldset>
</form>

<style>
  form {
    width: 100%;
    max-width: 48rem;
  }

  fieldset {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    margin-bottom: var(--space-3);
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-5);
    font-weight: 700;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    align-items: start;
    gap: var(--space-3);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }
</style>
