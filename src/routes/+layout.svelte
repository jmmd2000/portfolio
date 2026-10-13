<script lang="ts">
  import "../app.css";
  import monaSansLatin from "@fontsource-variable/mona-sans/files/mona-sans-latin-standard-normal.woff2?url";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="preload" href={monaSansLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

{@render children()}
