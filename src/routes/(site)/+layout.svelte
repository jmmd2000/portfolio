<script lang="ts">
  import { page } from "$app/state";
  import SiteChrome from "$lib/components/navigation/SiteChrome.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<SiteChrome currentPath={page.url.pathname} socials={data.socials} signedIn={data.signedIn} hasArticles={data.hasArticles}>
  {@render children()}
</SiteChrome>
