<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<!-- Fields sit side by side when there's room. Wrap a field in a .wide element to give it the full width -->
<div class="field-grid">
  {@render children()}
</div>

<style>
  .field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    align-items: start;
    gap: var(--space-2) var(--space-3);

    > :global(.wide) {
      grid-column: 1 / -1;
    }
  }
</style>
