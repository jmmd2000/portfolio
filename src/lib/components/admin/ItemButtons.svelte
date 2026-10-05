<script lang="ts">
  import { enhance } from "$app/forms";
  import ConfirmDelete from "./ConfirmDelete.svelte";
  import MoveButtons from "./MoveButtons.svelte";

  interface Props {
    id: number;
    name: string;
    deleteAction: string;
    moveAction?: string;
    first?: boolean;
    last?: boolean;
  }

  let { id, name, deleteAction, moveAction, first = false, last = false }: Props = $props();
</script>

<form method="POST" use:enhance>
  <input type="hidden" name="id" value={id} />
  {#if moveAction}
    <MoveButtons formaction={moveAction} {first} {last} />
  {/if}
  <ConfirmDelete {name} formaction={deleteAction} />
</form>

<style>
  form {
    display: flex;
    gap: var(--space-2);
  }
</style>
