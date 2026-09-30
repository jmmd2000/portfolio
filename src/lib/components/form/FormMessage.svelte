<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    state: "success" | "error";
    children: Snippet;
  }

  let { state, children }: Props = $props();
</script>

<p class={state} role={state === "success" ? "status" : "alert"}>{@render children()}</p>

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
