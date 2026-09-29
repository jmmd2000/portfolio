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

  const shareImageURL = new URL("/og.png", siteURL).href;
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if noindex}
    <meta name="robots" content="noindex" />
  {:else}
    <link rel="canonical" href={canonicalURL} />
    <meta property="og:url" content={canonicalURL} />
  {/if}

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={shareImageURL} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="James Doyle, Software Engineer, jamesmddoyle.com" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
