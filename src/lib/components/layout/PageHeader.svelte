<script lang="ts">
  import { fitText } from "$lib/attachments/fitText";

  interface Props {
    title: string;
    lead?: string;
  }

  let { title, lead }: Props = $props();
</script>

<header class="page-header">
  <h1 class="fitted-line" {@attach fitText(9)}><span class="part">{title}</span></h1>
  {#if lead}
    <p class="lead">{lead}</p>
  {/if}
</header>

<style>
  .page-header {
    padding: var(--space-3) var(--page-padding) var(--space-4);
    border-bottom: var(--rule-section);
  }

  h1 {
    margin-bottom: var(--space-3);
    color: var(--red);
    /* Close to the fitted size, so the heading barely moves when fitText runs */
    font-size: min(9rem, 24vw);
  }

  .lead {
    max-width: 36ch;
    font-size: var(--type-label);
    font-weight: 500;
    line-height: 1.3;
  }
</style>
