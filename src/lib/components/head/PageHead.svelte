<script lang="ts">
  import { page } from "$app/state";
  import { siteName, siteURL } from "$lib/site";

  interface Props {
    title?: string;
    description: string;
    noindex?: boolean;
  }

  let { title, description, noindex = false }: Props = $props();

  const fullTitle = $derived(title ? `${title} · ${siteName}` : siteName);
  const canonicalURL = $derived(new URL(page.url.pathname, siteURL).href);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {:else}
    <link rel="canonical" href={canonicalURL} />
  {/if}
</svelte:head>
