<script lang="ts">
  interface Props {
    title: string;
    intro?: string;
  }

  let { title, intro }: Props = $props();
</script>

<header class="page-header">
  <h1>{title}</h1>
  {#if intro}
    <p class="intro">{intro}</p>
  {/if}
</header>

<style>
  .page-header {
    padding-block: var(--old-space-7);
  }

  h1 {
    font-size: var(--font-size-page-title);
    line-height: 1.05;
  }

  .intro {
    max-width: 46ch;
    margin-top: var(--old-space-4);
    color: var(--colour-foreground);
    font-size: var(--font-size-title);
    font-weight: 450;
    line-height: 1.45;
    text-wrap: balance;
  }

  @media (max-width: 52rem) {
    .page-header {
      padding-block: var(--old-space-6);
    }
  }
</style>
