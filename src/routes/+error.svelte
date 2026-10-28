<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { fitText } from "$lib/attachments/fitText";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import SiteLayout from "$lib/components/layout/SiteLayout.svelte";
  import { ballSheet, chaseSprites } from "$lib/components/plum/chaseSprites";
  import PlumSprite from "$lib/components/plum/PlumSprite.svelte";

  const notFound = $derived(page.status === 404);
  const hasArticles = $derived(page.data.hasArticles ?? false);
</script>

{#if notFound}
  <PageHead title="Page not found" description="This page doesn't exist." noindex />
{:else}
  <PageHead title="Something went wrong" description="Something went wrong loading this page." noindex />
{/if}

<!-- An error page isn't any of the nav's pages, even when its address starts like one -->
<SiteLayout currentPath={null} socials={page.data.socials ?? []} {hasArticles}>
  <section class="error" aria-labelledby="error-heading">
    <p class="status fitted-line" aria-hidden="true" {@attach fitText(14)}><span class="part">{page.status}</span></p>
    {#if notFound}
      <h1 id="error-heading">This page doesn't exist.</h1>
      <p class="detail">Nothing lives at <code>{page.url.pathname}</code>.</p>
    {:else}
      <h1 id="error-heading">Something went wrong on my end.</h1>
      <p class="detail">It's not you. Try again in a minute, or head somewhere else.</p>
    {/if}
    <div class="ways label">
      <a href={resolve("/")}>Home</a>
      <a href={resolve("/projects")}>Projects</a>
      {#if hasArticles}
        <a href={resolve("/articles")}>Articles</a>
      {/if}
    </div>
    {#if notFound}
      <div class="plum">
        <div class="chase" aria-hidden="true">
          <PlumSprite sheet={chaseSprites.run} frame={0} label="Plum" />
          <PlumSprite sheet={ballSheet} frame={2} label="Plum's ball" />
        </div>
        <p>Plum got out too. She went after the ball.</p>
      </div>
    {/if}
  </section>
</SiteLayout>

<style>
  .error {
    padding: var(--space-3) var(--page-padding) var(--space-5);
    border-bottom: var(--rule-section);
  }

  .status {
    margin-bottom: var(--space-4);
    color: var(--red);
    /* Close to the fitted size, so the status barely moves when fitText runs */
    font-size: min(14rem, 55vw);
  }

  h1 {
    font-size: var(--type-large);
  }

  .detail {
    max-width: 60ch;
    margin-top: var(--space-2);
  }

  code {
    padding: 0.1em 0.35em;
    background: var(--sunken);
    font-family: var(--font-code);
    font-size: 0.9em;
    overflow-wrap: anywhere;
  }

  .ways {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin-top: var(--space-3);
  }

  .plum {
    margin-top: var(--space-5);
    font-weight: 700;
  }

  .chase {
    --plum-scale: 4;

    display: flex;
    align-items: flex-end;
    gap: var(--space-4);
    margin-bottom: var(--space-2);
    filter: drop-shadow(4px 0 0 var(--sprite-rim)) drop-shadow(-4px 0 0 var(--sprite-rim)) drop-shadow(0 4px 0 var(--sprite-rim)) drop-shadow(0 -4px 0 var(--sprite-rim));
  }

  @media (hover: none) {
    .ways a {
      padding-block: var(--space-1);
    }
  }
</style>
