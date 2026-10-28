<script lang="ts">
  import type { Snippet } from "svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";

  interface Props {
    title: string;
    description: string;
    children: Snippet;
  }

  let { title, description, children }: Props = $props();
</script>

<PageHead {title} {description} noindex />

<div class="head">
  <h1>{title}</h1>
</div>
<div class="content">
  {@render children()}
</div>

<style>
  .head {
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: var(--rule-row);
  }

  h1 {
    font-size: var(--type-large);
    font-weight: 900;
  }

  .content {
    display: grid;
    gap: var(--space-4);
    justify-items: start;

    > :global(*) {
      max-width: 100%;
    }
  }
</style>
