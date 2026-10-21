<script lang="ts">
  import { page } from "$app/state";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import SiteChrome from "$lib/components/navigation/SiteChrome.svelte";

  const notFound = $derived(page.status === 404);
</script>

{#if notFound}
  <PageHead title="Page not found" description="This page doesn't exist." noindex />
{:else}
  <PageHead title="Something went wrong" description="Something went wrong loading this page." noindex />
{/if}

<!-- An error page isn't any of the nav's pages, even when its address starts like one -->
<SiteChrome currentPath={null} socials={page.data.socials ?? []} signedIn={page.data.signedIn ?? false} hasArticles={page.data.hasArticles ?? false}>
  <section class="error" aria-labelledby="error-heading">
    <p class="code" aria-hidden="true">{page.status}</p>
    {#if notFound}
      <h1 id="error-heading">This page doesn't exist.</h1>
      <p class="detail">Nothing lives at <code>{page.url.pathname}</code>.</p>
    {:else}
      <h1 id="error-heading">Something went wrong on my end.</h1>
      <p class="detail">It's not you. Try again in a minute, or head somewhere else.</p>
    {/if}
  </section>
</SiteChrome>

<style>
  /* The code is set wide like the home page name, the only other place type is this big */
  .error {
    padding-block: var(--old-space-8) var(--old-space-7);
  }

  .code {
    color: var(--colour-foreground);
    font-size: clamp(5rem, 16vw, 11rem);
    font-weight: 620;
    font-stretch: 125%;
    line-height: 0.9;
    letter-spacing: -0.01em;
  }

  h1 {
    max-width: 34ch;
    margin-top: var(--old-space-5);
    font-size: var(--font-size-lead);
    font-weight: 450;
    font-stretch: 100%;
    line-height: 1.4;
  }

  .detail {
    max-width: 60ch;
    margin-top: var(--old-space-3);
  }

  code {
    padding: 0.1em 0.35em;
    border-radius: var(--radius-small);
    background: var(--colour-surface);
    color: var(--colour-foreground);
    font-family: inherit;
    overflow-wrap: anywhere;
  }

  @media (max-width: 52rem) {
    .error {
      padding-block: var(--old-space-7) var(--old-space-6);
    }
  }
</style>
