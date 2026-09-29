<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import PageHead from "$lib/components/head/PageHead.svelte";
</script>

{#if page.status === 404}
  <PageHead title="Page not found" description="This page does not exist." noindex />
{:else}
  <PageHead title="Something went wrong" description="Something went wrong loading this page." noindex />
{/if}

<section class="error">
  {#if page.status === 404}
    <h1>404</h1>
    <p class="message">This page does not exist.</p>
  {:else}
    <h1>{page.status}</h1>
    <p class="message">Something went wrong :(</p>
  {/if}
  <a href={resolve("/")} class="home-link">Go home</a>
</section>

<style>
  .error {
    padding: var(--space-6) 0;

    h1 {
      color: var(--colour-orange);
      font-size: var(--font-size-giant);
      font-weight: 800;
      font-stretch: 80%;
      letter-spacing: -0.06em;
    }
  }

  .message {
    max-width: 62ch;
    margin-top: var(--space-3);
    font-size: var(--font-size-4);
  }

  .home-link {
    display: inline-block;
    margin-top: var(--space-4);
    padding: var(--space-1) var(--space-3);
    border: var(--border-thick) solid var(--colour-orange);
    background: var(--colour-orange);
    color: var(--colour-text-on-orange);
    font-size: var(--font-size-2);
    font-weight: 600;
    text-decoration: none;
    transition:
      background var(--duration-quick) var(--ease-out),
      border-color var(--duration-quick) var(--ease-out),
      color var(--duration-quick) var(--ease-out);

    &:hover {
      border-color: var(--colour-foreground);
      background: var(--colour-foreground);
      color: var(--colour-background);
    }
  }
</style>
