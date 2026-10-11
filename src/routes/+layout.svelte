<script lang="ts">
  import "../app.css";
  import monaSansLatin from "@fontsource-variable/mona-sans/files/mona-sans-latin-standard-normal.woff2?url";
  import { page } from "$app/state";
  import Footer from "$lib/components/navigation/Footer.svelte";
  import Nav from "$lib/components/navigation/Nav.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="preload" href={monaSansLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="site">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="inner">
    <!-- An error page isn't any of the nav's pages, even when its address starts like one -->
    <Nav currentPath={page.error ? null : page.url.pathname} signedIn={data.signedIn} hasArticles={data.hasArticles} />
  </div>
  <main id="main" class="inner">
    {@render children()}
  </main>
  <Footer socials={data.socials} signedIn={data.signedIn} />
</div>

<style>
  .site {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .inner {
    width: 100%;
    max-width: var(--page-width);
    margin-inline: auto;
    padding-inline: var(--page-gutter);
  }

  main {
    flex: 1;
  }

  .skip-link {
    position: absolute;
    inset-inline-start: var(--space-4);
    inset-block-start: var(--space-4);
    z-index: 20;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-medium);
    background: var(--colour-foreground);
    color: var(--colour-background);
    font-weight: 500;
    text-decoration: none;
    transform: translateY(-200%);

    &:focus-visible {
      transform: none;
    }
  }
</style>
