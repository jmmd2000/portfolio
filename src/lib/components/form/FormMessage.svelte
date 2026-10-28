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
    font-weight: 700;
  }

  .success::before {
    content: "";
    display: inline-block;
    width: 0.6em;
    height: 0.6em;
    margin-right: 0.4em;
    background: var(--ink);
  }

  .error {
    color: var(--red-text);
  }
</style>
