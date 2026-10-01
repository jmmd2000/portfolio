<script lang="ts">
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { clearEditStatus, editStatus } from "./editStatus.svelte";

  function undo(run: () => void): void {
    clearEditStatus();
    run();
  }
</script>

<div class="edit-status" aria-live="polite">
  {#if editStatus.current}
    {@const { status, message, undo: undoEdit } = editStatus.current}
    <FormMessage {status}>
      {message}
      {#if undoEdit}
        <button type="button" class="undo" onclick={() => undo(undoEdit)}>Undo</button>
      {/if}
    </FormMessage>
  {/if}
</div>

<style>
  .edit-status {
    position: fixed;
    bottom: var(--space-4);
    left: var(--space-4);
    z-index: 10;
    max-width: min(32rem, calc(100% - 2 * var(--page-gutter)));
  }

  .undo {
    margin-left: var(--space-2);
    padding: 0;
    border: none;
    border-bottom: var(--border-thick) solid currentColor;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
</style>
