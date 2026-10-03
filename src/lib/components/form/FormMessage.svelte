<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    status: "success" | "error";
    children: Snippet;
  }

  let { status, children }: Props = $props();
</script>

<p class={status} role={status === "success" ? "status" : "alert"}>{@render children()}</p>

<style>
  p {
    padding: var(--space-2) var(--space-3);
    font-weight: 600;
  }

  .success {
    background: var(--colour-teal);
    color: var(--colour-text-on-teal);
  }

  .error {
    background: var(--colour-foreground);
    color: var(--colour-text-on-foreground);
  }
</style>
