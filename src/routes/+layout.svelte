<script lang="ts">
  import "../app.css";
  import albertSansLatin from "@fontsource-variable/albert-sans/files/albert-sans-latin-wght-normal.woff2?url";
  import bigShouldersLatin from "@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2?url";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="preload" href={bigShouldersLatin} as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href={albertSansLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

{@render children()}
