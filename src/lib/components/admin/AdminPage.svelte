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

<section>
  <h1>{title}</h1>
  {@render children()}
</section>

<style>
  section {
    display: grid;
    gap: var(--old-space-6);
    justify-items: start;
    padding-block: var(--old-space-7) 0;
  }

  h1 {
    font-size: var(--font-size-page-title);
    line-height: 1.05;
  }

  @media (max-width: 52rem) {
    section {
      padding-block-start: var(--old-space-6);
    }
  }
</style>
