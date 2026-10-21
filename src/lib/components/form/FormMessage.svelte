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
    padding: var(--old-space-2) var(--old-space-3);
    border-radius: var(--radius-medium);
    font-size: var(--font-size-label);
    font-weight: 500;
  }

  .success {
    background: var(--colour-tint);
    color: var(--colour-foreground);
  }

  .error {
    background: color-mix(in oklch, var(--colour-red) 12%, var(--colour-background));
    color: var(--colour-red);
  }
</style>
