<script lang="ts">
  import "../app.css";
  import bricolageLatin from "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wdth-normal.woff2?url";
  import geistLatin from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
  import { page } from "$app/state";
  import Footer from "$lib/components/navigation/Footer.svelte";
  import Nav from "$lib/components/navigation/Nav.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <link rel="preload" href={bricolageLatin} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={geistLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<div class="page">
  <Nav currentPath={page.url.pathname} />
  <main>
    {@render children()}
  </main>
  <Footer location={data.profile.location} socials={data.socials} />
</div>

<style>
  .page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 0 var(--page-gutter);
  }

  main {
    animation: enter var(--duration-entrance) var(--ease-out) both;
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }
</style>
