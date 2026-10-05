<script lang="ts">
  import Trash from "@lucide/svelte/icons/trash";
  import Button from "$lib/components/form/Button.svelte";

  interface Props {
    name: string;
    formaction: string;
  }

  let { name, formaction }: Props = $props();

  const dialogID = $props.id();
</script>

<Button commandfor={dialogID} command="show-modal" variant="destructive" icon aria-label="Delete"><Trash /></Button>
<dialog id={dialogID} aria-labelledby="{dialogID}-title">
  <h2 id="{dialogID}-title">Delete {name}?</h2>
  <p>This can't be undone.</p>
  <div class="actions">
    <Button commandfor={dialogID} command="close" autofocus>Keep</Button>
    <Button type="submit" {formaction} variant="destructive">Delete {name}</Button>
  </div>
</dialog>

<style>
  dialog {
    width: min(26rem, calc(100% - 2 * var(--page-gutter)));
    padding: var(--space-5);
    border: var(--border-thick) solid var(--colour-foreground);
    background: var(--colour-background);
    color: var(--colour-foreground);

    &::backdrop {
      background: oklch(0.2 0.02 60 / 45%);
      backdrop-filter: blur(3px);
    }

    h2 {
      font-size: var(--font-size-heading);
    }

    p {
      margin-block: var(--space-2) var(--space-4);
      color: var(--colour-text);
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-2);
  }
</style>
