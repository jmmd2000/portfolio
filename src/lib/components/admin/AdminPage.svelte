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
    gap: var(--space-5);
    justify-items: start;
    padding-top: var(--space-5);
  }

  h1 {
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }
</style>
